import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Role } from "$lib/schema";
import { getFormatter } from "$lib/i18n";
import { create } from "$lib/server/list";
import { getConfig } from "$lib/server/config";
import { requireLoginOrError } from "$lib/server/auth";

export const PUT: RequestHandler = async ({ request }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();

    const data = await request.json();

    if (!data.name) error(400, $t("errors.must-specify-group-name-in-body"));

    const group = await client.group.create({
        data: {
            name: data.name
        }
    });
    const config = await getConfig(group.id);

    const createList = config.enableDefaultListCreation ? create(user.id, group.id) : Promise.resolve();
    await Promise.all([
        client.userGroupMembership.create({
            data: {
                userId: user.id,
                groupId: group.id,
                roleId: Role.GROUP_MANAGER
            }
        }),
        createList
    ]);

    return new Response(JSON.stringify({ group }), { status: 201 });
};
