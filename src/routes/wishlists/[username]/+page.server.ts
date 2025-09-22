import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { getFormatter } from "$lib/server/i18n";
import { requireLogin } from "$lib/server/auth";
import { userRepository } from "$lib/server/db/user.repository";
import { listRepository } from "$lib/server/db/list.repository";

export const load: PageServerLoad = async ({ params }) => {
    const user = requireLogin();
    const $t = await getFormatter();

    const activeMembership = await getActiveMembership(user);
    const list = await userRepository
        .findByUsername(params.username)
        .then((user) => (user ? listRepository.findByOwnerIdAndGroupId(user?.id, activeMembership.groupId) : null));

    if (!list) {
        error(404, $t("errors.list-not-found"));
    }

    redirect(302, `/lists/${list.id}`);
};
