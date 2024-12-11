import { getFormatter } from "$lib/i18n";
import { client } from "$lib/server/prisma";
import type { User } from "@prisma/client";
import { type RequestHandler, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url }) => {
    const $t = await getFormatter();

    if (!locals.user) error(401, $t("errors.unauthenticated"));

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
