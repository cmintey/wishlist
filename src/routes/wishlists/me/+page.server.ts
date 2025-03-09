import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, "/login?ref=/wishlists/me");
    }
    const $t = await getFormatter();

    const activeMembership = await getActiveMembership(locals.user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        const list = await client.list.findFirst({
            select: {
                id: true
            },
            where: {
                ownerId: locals.user.id,
                groupId: activeMembership.groupId
            }
        });
        if (list) {
            redirect(302, `/lists/${list.id}`);
        }
        error(404, $t("errors.list-not-found"));
    }

    redirect(302, `/lists?users=${locals.user.id}`);
};
