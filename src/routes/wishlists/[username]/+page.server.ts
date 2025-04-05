import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getActiveMembership } from "$lib/server/group-membership";
import { getFormatter } from "$lib/server/i18n";
import { requireLogin } from "$lib/server/auth";

export const load: PageServerLoad = async ({ params }) => {
    const user = requireLogin();
    const $t = await getFormatter();

    const activeMembership = await getActiveMembership(user);
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
