import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { client } from "$lib/server/prisma";
import { getFormatter } from "$lib/server/i18n";
import { getListPropertiesSchema } from "$lib/server/validations";
import { trimToNull } from "$lib/util";
import { adjustListManagers, deleteList } from "$lib/server/list";
import { getConfig } from "$lib/server/config";
import { requireLogin } from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import z from "zod";
import { resolve } from "$app/paths";

export const load: PageServerLoad = async ({ params }) => {
    const user = requireLogin();

    const $t = await getFormatter();
    const activeMembership = await getActiveMembership(user);

    const config = await getConfig(activeMembership.groupId);
    const list = await client.list
        .findUnique({
            where: {
                id: params.id
            },
            select: {
                id: true,
                name: true,
                icon: true,
                iconColor: true,
                public: true,
                hideOwner: true,
                allowSelfClaims: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        picture: true
                    }
                },
                managers: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true
                            }
                        }
                    }
                },
                groupId: true,
                description: true
            }
        })
        .then((list) => list ?? error(404, $t("errors.list-not-found")));

    // Logged in users must be in the correct group, or viewing a public list
    if (list.owner.id !== user.id && !list.managers.find(({ user: manager }) => manager.id === user.id)) {
        error(401, $t("errors.not-authorized"));
    }
    if (list.groupId !== activeMembership.groupId) {
        error(401, $t("errors.user-must-be-in-the-correct-group"));
    }

    return {
        list: {
            ...list,
            managers: list.managers.map(({ user }) => ({ ...user }))
        },
        listMode: config.listMode,
        allowsPublicLists: config.allowPublicLists,
        claimsVisibleToOwner: config.claims.showForOwner,
        groupId: activeMembership.groupId
    };
};

export const actions: Actions = {
    persist: async ({ request, params }) => {
        const user = requireLogin();
        const $t = await getFormatter();

        const activeMembership = await getActiveMembership(user);
        const config = await getConfig(activeMembership.groupId);

        await canManage(params.id, user, activeMembership.groupId);

        const form = await request.formData();
        const listPropertiesSchema = getListPropertiesSchema();
        const listProperties = listPropertiesSchema.safeParse({
            name: form.get("name"),
            icon: form.get("icon"),
            iconColor: form.get("iconColor"),
            public: form.get("public"),
            hideOwner: form.get("hideOwner"),
            description: form.get("description"),
            managers: form.getAll("managers"),
            allowSelfClaims: form.get("allowSelfClaims")
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
        if (listProperties.data.allowSelfClaims && !config.claims.showForOwner) {
            return fail(400, {
                action: "persist",
                success: false,
                message: $t("errors.self-claims-not-available")
            });
        }

        try {
            await client.list.update({
                data: {
                    name: trimToNull(listProperties.data.name),
                    icon: trimToNull(listProperties.data.icon),
                    iconColor: trimToNull(listProperties.data.iconColor),
                    public: listProperties.data.public,
                    hideOwner: listProperties.data.hideOwner,
                    allowSelfClaims: listProperties.data.allowSelfClaims,
                    description: trimToNull(listProperties.data.description)
                },
                where: {
                    id: params.id
                }
            });

            await adjustListManagers(params.id, listProperties.data.managers);
        } catch (err) {
            logger.error({ err }, "Unable to update list settings");
            return fail(500, {
                action: "persist",
                success: false,
                message: $t("errors.unable-to-update-list-settings")
            });
        }

        return redirect(302, resolve("/lists/[id]", { id: params.id }));
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

        return redirect(302, resolve("/lists"));
    }
};

async function canManage(id: string, user: LocalUser, groupId: string) {
    const $t = await getFormatter();

    const list = await client.list.findUnique({
        select: {
            ownerId: true,
            managers: {
                select: {
                    userId: true
                }
            }
        },
        where: {
            id,
            groupId
        }
    });
    if (!list) {
        error(404, $t("errors.list-not-found"));
    }
    if (user.id !== list.ownerId && !list.managers.find(({ userId }) => userId === user.id)) {
        error(401, $t("errors.not-authorized"));
    }
}
