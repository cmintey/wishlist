import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { client } from "$lib/server/prisma";
import { getFormatter } from "$lib/server/i18n";
import { getListPropertiesSchema } from "$lib/server/validations";
import { trimToNull } from "$lib/util";
import { deleteList } from "$lib/server/list";
import { getConfig } from "$lib/server/config";
import { requireLogin } from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import z from "zod";

export const load: PageServerLoad = async ({ params }) => {
    const user = requireLogin();

    const $t = await getFormatter();
    const activeMembership = await getActiveMembership(user);

    const config = await getConfig(activeMembership.groupId);
    const list = await client.list
        .findUnique({
            where: {
                id: params.id,
                ownerId: user.id,
                groupId: activeMembership.groupId
            },
            select: {
                id: true,
                name: true,
                icon: true,
                iconColor: true,
                public: true,
                owner: {
                    select: {
                        name: true,
                        username: true,
                        picture: true
                    }
                },
                description: true
            }
        })
        .then((list) => list ?? error(404, $t("errors.list-not-found")));

    return {
        list,
        listMode: config.listMode,
        allowsPublicLists: config.allowPublicLists
    };
};

export const actions: Actions = {
    persist: async ({ request, params }) => {
        const user = requireLogin();
        const $t = await getFormatter();

        const activeMembership = await getActiveMembership(user);
        const config = await getConfig(activeMembership.groupId);
        const listOwner = await client.list.findUnique({
            select: {
                ownerId: true
            },
            where: {
                id: params.id,
                groupId: activeMembership.groupId
            }
        });
        if (user.id !== listOwner?.ownerId) {
            error(401, $t("errors.not-authorized"));
        }

        const form = await request.formData();
        const listPropertiesSchema = getListPropertiesSchema();
        const listProperties = listPropertiesSchema.safeParse({
            name: form.get("name"),
            icon: form.get("icon"),
            iconColor: form.get("iconColor"),
            public: form.get("public"),
            description: form.get("description")
        });
        if (listProperties.error) {
            return fail(422, {
                success: false,
                errors: z.flattenError(listProperties.error).fieldErrors
            });
        }
        if (listProperties.data.public && !config.allowPublicLists) {
            return fail(400, {
                action: "persist",
                success: false,
                message: $t("errors.public-lists-not-allowed")
            });
        }
        if (!listProperties.data.public && config.listMode === "registry") {
            listProperties.data.public = true;
        }

        try {
            await client.list.update({
                data: {
                    name: trimToNull(listProperties.data.name),
                    icon: trimToNull(listProperties.data.icon),
                    iconColor: trimToNull(listProperties.data.iconColor),
                    public: listProperties.data.public,
                    description: trimToNull(listProperties.data.description)
                },
                where: {
                    id: params.id
                }
            });
        } catch (err) {
            logger.error({ err }, "Unable to update list settings");
            return fail(500, {
                action: "persist",
                success: false,
                message: $t("errors.unable-to-update-list-settings")
            });
        }

        return redirect(302, `/lists/${params.id}`);
    },
    delete: async ({ params }) => {
        const user = requireLogin();
        const $t = await getFormatter();

        const activeMembership = await getActiveMembership(user);
        const listOwner = await client.list.findUnique({
            select: {
                ownerId: true
            },
            where: {
                id: params.id,
                groupId: activeMembership.groupId
            }
        });
        if (user.id !== listOwner?.ownerId) {
            error(401, $t("errors.not-authorized"));
        }

        try {
            deleteList(params.id);
        } catch (err) {
            logger.error({ err }, "Unable to delete list");
            return fail(500, { action: "delete", success: false, message: $t("errors.unable-to-delete-list") });
        }

        return redirect(302, `/lists`);
    }
};
