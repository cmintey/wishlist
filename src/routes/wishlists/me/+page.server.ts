import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import { getFormatter } from "$lib/server/i18n";
import { requireLogin } from "$lib/server/auth";

export const load: PageServerLoad = async () => {
    const user = requireLogin();
    const $t = await getFormatter();

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        const list = await client.list.findFirst({
            select: {
                id: true
            },
            where: {
                ownerId: user.id,
                groupId: activeMembership.groupId
            }
        });
        if (list) {
            redirect(302, `/lists/${list.id}`);
        }
        error(404, $t("errors.list-not-found"));
    }

    redirect(302, `/lists?users=${user.id}`);
};
