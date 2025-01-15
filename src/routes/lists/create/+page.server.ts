import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getFormatter } from "$lib/i18n";
import { trimToNull } from "$lib/util";
import { getListPropertiesSchema } from "$lib/validations";
import { create } from "$lib/server/list";

export const load = (async ({ locals, url }) => {
    const user = locals.user;
    if (!user) {
        redirect(302, `/login?ref=${url.pathname + url.search}`);
    }

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        redirect(302, "/wishlists/me");
    }

    return {
        list: {
            name: null,
            icon: null,
            owner: {
                name: user.name,
                username: user.username,
                picture: user.picture || null
            }
        }
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const $t = await getFormatter();
        if (!locals.user) {
            error(401, $t("errors.unauthenticated"));
        }

        const activeMembership = await getActiveMembership(locals.user);

        const form = await request.formData();
        const listPropertiesSchema = getListPropertiesSchema();
        const listProperties = listPropertiesSchema.safeParse({
            name: form.get("name"),
            icon: form.get("icon"),
            iconColor: form.get("iconColor")
        });
        if (listProperties.error) {
            return fail(422, {
                success: false,
                errors: listProperties.error.format()
            });
        }

        let list;
        try {
            const data = {
                name: trimToNull(listProperties.data.name),
                icon: trimToNull(listProperties.data.icon),
                iconColor: trimToNull(listProperties.data.iconColor)
            };
            list = await create(locals.user.id, activeMembership.groupId, data);
        } catch (e) {
            console.log("Unable to create list", e);
            return fail(500, { success: false });
        }

        return redirect(302, `/lists/${list.id}`);
    }
};
