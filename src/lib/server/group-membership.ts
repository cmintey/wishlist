import { redirect } from "@sveltejs/kit";
import { userGroupRepository } from "./db/userGroup.repository";

export const getActiveMembership = async (user: LocalUser) => {
    const activeMembership = await userGroupRepository.findActive(user.id);

    if (!activeMembership) {
        const membership = await userGroupRepository.findAllByUserId(user.id);
        if (!membership) {
            redirect(302, "/group-error");
        }
        return await userGroupRepository.update(membership.id, { active: true });
    }

    return activeMembership;
};
