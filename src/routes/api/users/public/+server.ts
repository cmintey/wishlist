import { getFormatter } from "$lib/i18n";
import { client } from "$lib/server/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const $t = await getFormatter();
    const data = await request.json();
    if (!data.username) {
        error(422, $t("errors.username-not-specified"));
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
