import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { client } from "$lib/server/prisma";
import { requireAccessToGroup } from "./auth";
import { getFormatter } from "$lib/i18n";
import { deleteLists } from "$lib/server/list";

export const DELETE: RequestHandler = async ({ params }) => {
    const $t = await getFormatter();
    const { authenticated } = await requireAccessToGroup(params.groupId);

    if (!authenticated) {
        error(401, $t("errors.not-authorized"));
    }

    const group = await client.group.findUnique({
        where: {
            id: params.groupId
        }
    });

    if (!group) error(404, $t("errors.group-does-not-exist"));

    await client.userGroupMembership.deleteMany({
        where: {
            groupId: group.id
        }
    });

    const deletedGroup = await client.group.delete({
        where: {
            id: group.id
        }
    });

    await deleteLists(undefined, group.id);

    return new Response(JSON.stringify(deletedGroup));
};

export const PATCH: RequestHandler = async ({ params, request }) => {
    const $t = await getFormatter();
    const { authenticated } = await requireAccessToGroup(params.groupId);

    if (!authenticated) {
        error(401, $t("errors.not-authorized"));
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (!body?.name) {
        return new Response(JSON.stringify({}), { status: 200 });
    }

    const group = await client.group.findUnique({
        where: {
            id: params.groupId
        }
    });

    if (!group) error(404, $t("errors.group-does-not-exist"));

    const updatedGroup = await client.group.update({
        data: {
            name: body.name
        },
        where: {
            id: group.id
        }
    });

    return new Response(JSON.stringify(updatedGroup), { status: 200 });
};
