import { toGroupInformation } from "$lib/dtos/group-mapper";
import { client } from "$lib/server/prisma";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    let groups: GroupInformation[] | null = null;
    if (locals.user) {
        const membership = await client.userGroupMembership.findMany({
            where: {
                userId: locals.user.id
            },
            select: {
                group: true,
                active: true,
                role: true
            }
        });

        groups = membership.map(toGroupInformation).toSorted((a, b) => a.name.localeCompare(b.name, locals.locale));
    }

    return { user: locals.user, groups, isProxyUser: locals.isProxyUser, locale: locals.locale };
}) satisfies LayoutServerLoad;
