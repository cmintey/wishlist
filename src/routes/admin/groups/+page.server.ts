import { Role } from "#lib/schema.js";
import { client } from "#lib/server/prisma.js";
import type { PageServerLoad } from "./$types";
import { requireRole } from "#lib/server/auth.js";

export const load: PageServerLoad = async () => {
    await requireRole(Role.ADMIN);

    const groups = await client.group
        .findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        UserGroupMembership: true
                    }
                }
            }
        })
        .then((groups) => groups.map((group) => ({ userCount: group._count.UserGroupMembership, ...group })));

    return {
        groups
    };
};
