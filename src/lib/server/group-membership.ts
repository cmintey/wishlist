import { error, redirect } from "@sveltejs/kit";
import { client } from "./prisma";
import type { UserGroupMembership } from "@prisma/client";
import { getFormatter } from "./i18n";

export const getActiveMembership = async (user: LocalUser) => {
    const activeMembership = await client.userGroupMembership.findFirst({
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
        return await client.userGroupMembership.update({
            where: {
                id: membership.id
            },
            data: {
                active: true
            }
        });
    }

    return activeMembership;
};

export const setActiveMembership = async (userId: string, groupId: string) => {
    const $t = await getFormatter();

    const activeMembership = await client.userGroupMembership.findFirst({
        where: {
            userId,
            active: true
        }
    });

    let membership: UserGroupMembership;
    try {
        membership = await client.userGroupMembership.findFirstOrThrow({
            where: {
                groupId,
                userId
            }
        });
    } catch {
        error(400, $t("errors.user-is-not-a-member-of-the-group"));
    }

    if (activeMembership?.id === membership.id) {
        return membership;
    }

    membership = await client.userGroupMembership.update({
        where: {
            id: membership.id
        },
        data: {
            active: true
        }
    });

    if (activeMembership) {
        await client.userGroupMembership.update({
            where: {
                id: activeMembership.id
            },
            data: {
                active: false
            }
        });
    }
    return membership;
};
