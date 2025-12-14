import { Role } from "$lib/schema";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getFormatter } from "$lib/server/i18n";
import { requireLoginOrError } from "$lib/server/auth";
import { setActiveMembership } from "$lib/server/group-membership";

export const PATCH: RequestHandler = async ({ params, request }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();
    if (params.userId !== user.id && user.roleId !== Role.ADMIN) {
        error(401, $t("errors.not-authorized"));
    }

    const data = await request.json();

    if (data.active) {
        const membership = await setActiveMembership(params.userId, params.groupId);

        return new Response(JSON.stringify({ membership }));
    }

    return new Response();
};
