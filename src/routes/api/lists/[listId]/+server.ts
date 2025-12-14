import { client } from "$lib/server/prisma";
import { publicListCreateSchema } from "$lib/server/validations";
import { error } from "@sveltejs/kit";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/server/i18n";
import { getById } from "$lib/server/list";
import type { Prisma } from "$lib/generated/prisma/client";
import type { RequestHandler } from "./$types";
import { requireLoginOrError } from "$lib/server/auth";

export const PATCH: RequestHandler = async ({ request, params }) => {
    await requireLoginOrError();
    const $t = await getFormatter();

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
