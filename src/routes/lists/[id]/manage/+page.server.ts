import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { client } from "$lib/server/prisma";
import { getFormatter } from "$lib/server/i18n";
import { Role } from "$lib/schema";
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
                id: params.id
            },
            select: {
                id: true,
                name: true,
                icon: true,
                iconColor: true,
                public: true,
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
    const isManager = !!list.managers.find(({ user: manager }) => manager.id === user.id);
    const isAdmin = user.roleId === Role.ADMIN;
    const isGroupManager = activeMembership.roleId === Role.GROUP_MANAGER;
    if (list.owner.id !== user.id && !isManager && !isAdmin && !isGroupManager) {
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
            description: form.get("description"),
            managers: form.getAll("managers")
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

            const managers = listProperties.data.managers;
            if (managers) {
                const existingManagers = await client.listManager.findMany({
                    where: {
                        listId: params.id
                    }
                });
                const managersToDelete = existingManagers
                    .filter(({ userId }) => !managers.includes(userId))
                    .map(({ id }) => id);
                const managersToCreate = managers.filter(
                    (userId) => existingManagers.find((manager) => manager.userId === userId) === undefined
                );
                await client.$transaction([
                    client.listManager.deleteMany({ where: { id: { in: managersToDelete } } }),
                    client.listManager.createMany({
                        data: managersToCreate.map((userId) => ({ listId: params.id, userId }))
                    })
                ]);
            }
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
        const isAdmin = user.roleId === Role.ADMIN;
        const isGroupManager = activeMembership.roleId === Role.GROUP_MANAGER;
        if (user.id !== listOwner?.ownerId && !isAdmin && !isGroupManager) {
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
    if (user.id === list.ownerId) return;
    if (list.managers.find(({ userId }) => userId === user.id)) return;
    if (user.roleId === Role.ADMIN) return;

    const membership = await client.userGroupMembership.findFirst({
        where: {
            userId: user.id,
            groupId
        }
    });
    if (membership?.roleId === Role.GROUP_MANAGER) return;

    error(401, $t("errors.not-authorized"));
}
