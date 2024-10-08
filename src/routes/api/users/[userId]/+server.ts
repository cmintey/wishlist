import { Role } from "$lib/schema";
import { tryDeleteImage } from "$lib/server/image-util";
import { client } from "$lib/server/prisma";
import { type RequestHandler, error } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) error(401, "user is not authenticated");
    if (!(locals.user.roleId === Role.ADMIN)) error(401, "must be admin to delete a user");

    if (!params.userId) {
        error(400, "must specify an item to delete");
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
        error(404, "user id not found");
    }

    if (user.id === locals.user.id) {
        error(400, "cannot delete yourself");
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
        error(404, "user id not found");
    }
};
