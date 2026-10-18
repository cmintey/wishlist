import { Role } from "$lib/schema";
import { invalidateUserSessions, requireRole } from "$lib/server/auth";
import { getFormatter } from "$lib/server/i18n";
import { client } from "$lib/server/prisma";
import { type RequestHandler, error } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ params }) => {
    await requireRole(Role.ADMIN);
    const $t = await getFormatter();

    if (!params.userId) {
        error(400, $t("errors.must-specify-an-item-to-delete"));
    }

    const user = await client.user.findUnique({
        where: { id: params.userId },
        select: { id: true }
    });

    if (!user) {
        error(404, $t("errors.user-not-found"));
    }

    await invalidateUserSessions(user.id);
    return new Response(null, { status: 204 });
};
