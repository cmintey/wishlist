import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import type { User } from "@prisma/client";
import { hashPassword } from "./password";
import { userRepository } from "./db/user.repository";
import { signupTokenRepository } from "./db/signupToken.repository";
import { groupRepository } from "./db/group.repository";
import { userGroupRepository } from "./db/userGroup.repository";
import { randomUUID } from "crypto";
import { listRepository } from "./db/list.repository";

interface UserMinimal extends Pick<User, "username" | "email" | "name"> {
    oauthId?: string | null;
}

export const createUser = async (user: UserMinimal, role: Role, password: string, signupTokenId?: string) => {
    const config = await getConfig();
    const userCount = await userRepository.count();

    let groupId = config.defaultGroup;
    if (signupTokenId) {
        groupId = await signupTokenRepository.findById(signupTokenId).then((data) => data?.groupId);
    } else if (userCount === 0) {
        groupId = await groupRepository.findAny().then((data) => data?.id);
    }
    const hashedPassword = await hashPassword(password);

    const newUser = await userRepository.create({
        username: user.username,
        name: user.name,
        email: user.email,
        roleId: role,
        hashedPassword,
        oauthId: user.oauthId
    });

    if (groupId) {
        const groupConfig = await getConfig(groupId);
        const createList = groupConfig.enableDefaultListCreation
            ? listRepository.create({ ownerId: newUser.id, groupId })
            : Promise.resolve();
        await Promise.all([
            userGroupRepository.create({ id: randomUUID(), groupId, userId: newUser.id, active: true }),
            createList
        ]);
    }

    if (signupTokenId) {
        await signupTokenRepository.update(signupTokenId, { redeemed: true });
    }

    return newUser;
};
