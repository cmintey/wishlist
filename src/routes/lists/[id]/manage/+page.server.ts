import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { client } from "$lib/server/prisma";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals, url, params }) => {
    const user = locals.user;
    if (!user) {
        redirect(302, `/login?ref=${url.pathname + url.search}`);
    }

    const $t = await getFormatter();
    const activeMembership = await getActiveMembership(user);

    const list = await client.list
        .findUnique({
            where: {
                id: params.id,
                ownerId: user.id,
                groupId: activeMembership.groupId
            },
            select: {
                id: true,
                name: true,
                icon: true,
                iconColor: true,
                owner: {
                    select: {
                        name: true,
                        username: true,
                        picture: true
                    }
                }
            }
        })
        .then((list) => list ?? error(404, $t("errors.list-not-found")));

    return {
        list
    };
};
