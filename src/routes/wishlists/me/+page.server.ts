import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { getConfig } from "$lib/server/config";
import { error } from "@sveltejs/kit";
import { getFormatter } from "$lib/server/i18n";
import { requireLogin } from "$lib/server/auth";
import { listRepository } from "$lib/server/db/list.repository";

export const load: PageServerLoad = async () => {
    const user = requireLogin();
    const $t = await getFormatter();

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        const list = await listRepository.findByOwnerIdAndGroupId(user.id, activeMembership.groupId);
        if (list) {
            redirect(302, `/lists/${list.id}`);
        }
        error(404, $t("errors.list-not-found"));
    }

    redirect(302, `/lists?users=${user.id}`);
};
