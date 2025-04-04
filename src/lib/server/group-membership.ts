import { redirect } from "@sveltejs/kit";
import { client } from "./prisma";

export const getActiveMembership = async (user: LocalUser) => {
    let activeMembership = await client.userGroupMembership.findFirst({
        where: {
            userId: user.id,
            active: true
        }
    });

    if (!activeMembership) {
        const membership = await client.userGroupMembership.findFirst({
            where: {
                userId: user.id
            }
        });
        if (!membership) {
            redirect(302, "/group-error");
        }
        await client.userGroupMembership.update({
            where: {
                id: membership.id
            },
            data: {
                active: true
            }
        });
        activeMembership = membership;
    }

    return activeMembership;
};
