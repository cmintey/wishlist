import { client } from "$lib/server/prisma";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    let user = await client.systemUser.findFirst({
        where: {
            username: data.username,
            name: data.name
        },
        select: {
            id: true
        }
    });

    if (!user) {
        user = await client.systemUser.create({
            select: {
                id: true
            },
            data: {
                username: data.username,
                name: data?.name
            }
        });
    }

    return new Response(JSON.stringify(user));
};
