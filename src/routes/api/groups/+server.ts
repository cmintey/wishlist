import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Role } from "$lib/schema";
import { getFormatter } from "$lib/i18n";
import { create } from "$lib/server/list";
import { getConfig } from "$lib/server/config";

export const PUT: RequestHandler = async ({ locals, request }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        error(401, $t("errors.unauthenticated"));
    }

    const data = await request.json();

    if (!data.name) error(400, $t("errors.must-specify-group-name-in-body"));

    const group = await client.group.create({
        data: {
            name: data.name
        }
    });
    const config = await getConfig(group.id);

    const createList = config.enableDefaultListCreation ? create(locals.user.id, group.id) : Promise.resolve();
    await Promise.all([
        client.userGroupMembership.create({
            data: {
                userId: locals.user.id,
                groupId: group.id,
                roleId: Role.GROUP_MANAGER
            }
        }),
        createList
    ]);

    return new Response(JSON.stringify({ group }), { status: 201 });
};
