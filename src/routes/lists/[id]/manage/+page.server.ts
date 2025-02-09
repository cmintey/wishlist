import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { client } from "$lib/server/prisma";
import { getFormatter } from "$lib/i18n";
import { getListPropertiesSchema } from "$lib/validations";
import { trimToNull } from "$lib/util";
import { deleteList } from "$lib/server/list";

export const load: PageServerLoad = async ({ locals, url, params }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=${url.pathname + url.search}`);
    }

    const $t = await getFormatter();
    const activeMembership = await getActiveMembership(locals.user);

    const list = await client.list
        .findUnique({
            where: {
                id: params.id,
                ownerId: locals.user.id,
                groupId: activeMembership.groupId
            },
            select: {
                id: true,
                name: true,
                icon: true,
                iconColor: true,
                owner: {
                    select: {
                        name: true,
                        username: true,
                        picture: true
                    }
                }
            }
        })
        .then((list) => list ?? error(404, $t("errors.list-not-found")));

    return {
        list
    };
};

export const actions: Actions = {
    persist: async ({ request, locals, params }) => {
        const $t = await getFormatter();
        if (!locals.user) {
            error(401, $t("errors.unauthenticated"));
        }

        const activeMembership = await getActiveMembership(locals.user);
        const listOwner = await client.list.findUnique({
            select: {
                ownerId: true
            },
            where: {
                id: params.id,
                groupId: activeMembership.groupId
            }
        });
        if (locals.user.id !== listOwner?.ownerId) {
            error(401, $t("errors.not-authorized"));
        }

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

        try {
            await client.list.update({
                data: {
                    name: trimToNull(listProperties.data.name),
                    icon: trimToNull(listProperties.data.icon),
                    iconColor: trimToNull(listProperties.data.iconColor)
                },
                where: {
                    id: params.id
                }
            });
        } catch (e) {
            console.log($t("errors.unable-to-update-list-settings"), e);
            return fail(500, {
                action: "persist",
                success: false,
                message: $t("errors.unable-to-update-list-settings")
            });
        }

        return redirect(302, `/lists/${params.id}`);
    },
    delete: async ({ locals, params }) => {
        const $t = await getFormatter();
        if (!locals.user) {
            error(401, $t("errors.unauthenticated"));
        }

        const activeMembership = await getActiveMembership(locals.user);
        const listOwner = await client.list.findUnique({
            select: {
                ownerId: true
            },
            where: {
                id: params.id,
                groupId: activeMembership.groupId
            }
        });
        if (locals.user.id !== listOwner?.ownerId) {
            error(401, $t("errors.not-authorized"));
        }

        try {
            deleteList(params.id);
        } catch (e) {
            console.log($t("errors.unable-to-delete-list"), e);
            return fail(500, { action: "delete", success: false, message: $t("errors.unable-to-delete-list") });
        }

        return redirect(302, `/lists`);
    }
};
