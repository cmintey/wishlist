import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { type RequestHandler, error } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ params, locals }) => {
    const session = await locals.validate();

    if (!session) error(401, "user is not authenticated");
    if (!(session.user.roleId === Role.ADMIN)) error(401, "must be admin to delete a user");

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

    if (user.id === session.user.userId) {
        error(400, "cannot delete yourself");
    }

    try {
        await client.userGroupMembership.deleteMany({
            where: {
                userId: user.id
            }
        });
        const deletedUser = await client.user.delete({
            where: {
                id: user.id
            }
        });

        return new Response(JSON.stringify(deletedUser), { status: 200 });
    } catch (e) {
        error(404, "user id not found");
    }
};
