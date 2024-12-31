import { client } from "$lib/server/prisma";
import { publicListCreateSchema } from "$lib/validations";
import { error } from "@sveltejs/kit";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/i18n";
import { getById } from "$lib/server/list";
import type { Prisma } from "@prisma/client";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        error(401, $t("errors.unauthenticated"));
    }

    const list = await getById(params.listId);
    if (!list) {
        error(404, $t("errors.list-not-found"));
    }

    const config = await getConfig(list.groupId);
    if (config.listMode !== "registry") {
        error(422, $t("errors.group-is-not-in-registry-mode-cannot-get-a-public-link"));
    }

    const data = await request.json().then(publicListCreateSchema.safeParse);

    if (!data.success) {
        error(422, data.error.message);
    }
    const publicList = data.data.public;

    const updateData: Prisma.ListUpdateInput = {};
    if (publicList !== undefined) updateData.public = publicList;

    const updatedList = await client.list.update({
        where: {
            id: params.listId
        },
        data: updateData
    });

    return new Response(JSON.stringify(updatedList), { status: 200 });
};
