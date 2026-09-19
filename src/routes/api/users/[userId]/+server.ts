import { getFormatter } from "$lib/server/i18n";
import { Role } from "$lib/schema";
import { requireRole } from "$lib/server/auth";
import { tryDeleteImage } from "$lib/server/image-util";
import { client } from "$lib/server/prisma";
import { type RequestHandler, error } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ params }) => {
    const authUser = await requireRole(Role.ADMIN);
    const $t = await getFormatter();

    if (!params.userId) {
        error(400, $t("errors.must-specify-an-item-to-delete"));
    }

    const user = await client.user.findUnique({
        where: {
            id: params.userId
        },
        select: {
            id: true
        }
    });

    if (!user) {
        error(404, $t("errors.user-not-found"));
    }

    if (user.id === authUser.id) {
        error(400, $t("errors.cannot-delete-yourself"));
    }

    try {
        const deletedUser = await client.user.delete({
            where: {
                id: user.id
            }
        });
        if (deletedUser && deletedUser.picture) {
            await tryDeleteImage(deletedUser.picture);
        }

        return new Response(JSON.stringify(deletedUser), { status: 200 });
    } catch {
        error(404, $t("errors.user-not-found"));
    }
};
