import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getActiveMembership } from "$lib/server/group-membership";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals, url, params }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        redirect(302, `/login?ref=${url.pathname}`);
    }

    const activeMembership = await getActiveMembership(locals.user);
    const list = await client.list.findFirst({
        select: {
            id: true
        },
        where: {
            owner: {
                username: params.username
            },
            groupId: activeMembership.groupId
        }
    });

    if (!list) {
        error(404, $t("errors.list-not-found"));
    }

    redirect(302, `/lists/${list.id}`);
};
