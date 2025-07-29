import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getFormatter } from "$lib/server/i18n";
import { trimToNull } from "$lib/util";
import { getListPropertiesSchema } from "$lib/server/validations";
import { create } from "$lib/server/list";
import { client } from "$lib/server/prisma";
import { requireLogin } from "$lib/server/auth";
import { logger } from "$lib/server/logger";

export const load = (async () => {
    const user = requireLogin();

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        const listCount = await client.list.count({
            where: {
                ownerId: user.id,
                groupId: activeMembership.groupId
            }
        });
        if (listCount === 1) {
            redirect(302, "/wishlists/me");
        }
    }

    return {
        list: {
            name: null,
            icon: null,
            owner: {
                name: user.name,
                username: user.username,
                picture: user.picture || null
            },
            description: null
        },
        listMode: config.listMode,
        allowsPublicLists: config.allowPublicLists
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    persist: async ({ request }) => {
        const user = requireLogin();
        const $t = await getFormatter();

        const activeMembership = await getActiveMembership(user);
        const config = await getConfig(activeMembership.groupId);
        if (config.listMode === "registry") {
            const listCount = await client.list.count({
                where: {
                    ownerId: user.id,
                    groupId: activeMembership.groupId
                }
            });
            if (listCount === 1) {
                return fail(400, {
                    success: false,
                    error: $t("errors.in-registry-mode-you-can-only-have-one-list")
                });
            }
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
                formErrors: listProperties.error.format()
            });
        }
        if (listProperties.data.public && !config.allowPublicLists) {
            return fail(400, {
                action: "create",
                success: false,
                message: $t("errors.public-lists-not-allowed")
            });
        }
        if (!listProperties.data.public && config.listMode === "registry") {
            listProperties.data.public = true;
        }

        let list;
        try {
            const data = {
                name: trimToNull(listProperties.data.name),
                icon: trimToNull(listProperties.data.icon),
                iconColor: trimToNull(listProperties.data.iconColor),
                public: listProperties.data.public,
                description: trimToNull(listProperties.data.description)
            };
            list = await create(user.id, activeMembership.groupId, data);
        } catch (err) {
            logger.error({ err }, "Unable to create list");
            return fail(500, { success: false, error: $t("errors.unable-to-create-list") });
        }

        return redirect(302, `/lists/${list.id}`);
    }
};
