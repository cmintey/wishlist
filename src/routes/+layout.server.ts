import { toGroupInformation } from "$lib/dtos/group-mapper";
import { userGroupRepository } from "$lib/server/db/userGroup.repository";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    let groups: GroupInformation[] | null = null;
    if (locals.user) {
        const membership = await userGroupRepository.findGroupsByUserId(locals.user.id);
        groups = membership.map(toGroupInformation).toSorted((a, b) => a.name.localeCompare(b.name, locals.locale));
    }

    return { user: locals.user, groups, isProxyUser: locals.isProxyUser, locale: locals.locale };
}) satisfies LayoutServerLoad;
