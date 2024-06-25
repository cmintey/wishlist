import { client } from "$lib/server/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    if (!data.username) {
        error(422, "Username not specified");
    }
    const user = await client.systemUser.create({
        select: {
            id: true
        },
        data: {
            username: data.username,
            name: data?.name
        }
    });

    return new Response(JSON.stringify(user));
};
