import { requireLoginOrError } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import type { User } from "@prisma/client";
import { type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    await requireLoginOrError();

    let users: User[] = [];

    users = await client.user.findMany({
        where: {
            name: {
                contains: url.searchParams.get("name") || undefined
            }
        }
    });

    return new Response(JSON.stringify(users));
};
