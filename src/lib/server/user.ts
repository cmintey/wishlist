import { client } from "$lib/server/prisma";
import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { LegacyScrypt } from "lucia";
import type { User } from "@prisma/client";
import { create } from "./list";

type UserMinimal = Pick<User, "username" | "email" | "name">;

export const createUser = async (user: UserMinimal, role: Role, password: string, signupTokenId?: string) => {
    const config = await getConfig();
    const userCount = await client.user.count();

    let groupId = config.defaultGroup;
    if (signupTokenId) {
        groupId = await client.signupToken
            .findUnique({
                where: {
                    id: signupTokenId
                },
                select: {
                    groupId: true
                }
            })
            .then((data) => data?.groupId);
    } else if (userCount === 0) {
        groupId = (
            await client.group.findFirst({
                select: {
                    id: true
                }
            })
        )?.id;
    }
    const hashedPassword = await new LegacyScrypt().hash(password);

    const newUser = await client.user.create({
        select: {
            id: true
        },
        data: {
            username: user.username,
            name: user.name,
            email: user.email,
            roleId: role,
            hashedPassword
        }
    });

    if (groupId) {
        const groupConfig = await getConfig(groupId);
        const createList = groupConfig.enableDefaultListCreation ? create(newUser.id, groupId) : Promise.resolve();
        await Promise.all([
            client.userGroupMembership.create({
                data: {
                    groupId: groupId,
                    userId: newUser.id,
                    active: true
                }
            }),
            createList
        ]);
    }

    if (signupTokenId) {
        await client.signupToken.update({
            where: {
                id: signupTokenId
            },
            data: {
                redeemed: true
            }
        });
    }

    return newUser;
};
