import { client } from "$lib/server/prisma";
import { type RequestHandler } from "@sveltejs/kit";
import { getConfig } from "$lib/server/config";
import { error } from "@sveltejs/kit";
import { getFormatter } from "$lib/server/i18n";

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const $t = await getFormatter();

    // Validate email requirement for public users
    const config = await getConfig();
    if (config.claims.requireEmail && !data.username) {
        error(422, $t("errors.email-is-required-for-public-claims"));
    }

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
