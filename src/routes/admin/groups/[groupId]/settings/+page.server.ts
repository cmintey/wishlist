import { getConfig, writeConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { settingSchema } from "$lib/server/validations";
import { requireAdminOrManager } from "$lib/server/auth";

export const load = (async ({ params }) => {
    await requireAdminOrManager(params.groupId);

    const group = await client.group.findUniqueOrThrow({
        where: {
            id: params.groupId
        },
        select: {
            id: true
        }
    });

    const [membershipCount, listCount, config] = await Promise.all([
        client.userGroupMembership.count({
            where: {
                groupId: group.id
            }
        }),
        client.list.count({
            where: {
                groupId: group.id
            }
        }),
        getConfig(group.id)
    ]);

    return {
        config,
        membershipCount,
        listCount
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async ({ request, params }) => {
        await requireAdminOrManager(params.groupId);

        const formData = Object.fromEntries(await request.formData());
        const groupSettingSchema = settingSchema.pick({
            suggestionMethod: true,
            enableSuggestions: true,
            claimsShowName: true,
            claimsRequireEmail: true,
            listMode: true,
            enableDefaultListCreation: true,
            allowPublicLists: true
        });

        const configData = groupSettingSchema.safeParse(formData);

        if (!configData.success) {
            const errors = configData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { action: "settings", error: "Validation failed", errors });
        }

        const existingConfig = await getConfig(params.groupId);
        const newConfig: Pick<
            Config,
            "suggestions" | "claims" | "listMode" | "enableDefaultListCreation" | "allowPublicLists"
        > = {
            suggestions: {
                enable: configData.data.enableSuggestions,
                method: configData.data.suggestionMethod
            },
            claims: {
                showName: configData.data.claimsShowName,
                requireEmail: configData.data.claimsRequireEmail
            },
            listMode: configData.data.listMode,
            enableDefaultListCreation: configData.data.enableDefaultListCreation,
            allowPublicLists: configData.data.allowPublicLists
        };

        let changingToRegistry = false;
        if (existingConfig.listMode !== newConfig.listMode && newConfig.listMode === "registry") {
            changingToRegistry = true;
            const [membershipCount, listCount] = await Promise.all([
                client.userGroupMembership.count({
                    where: {
                        groupId: params.groupId
                    }
                }),
                client.list.count({
                    where: {
                        groupId: params.groupId
                    }
                })
            ]);
            if (membershipCount > 1 || listCount > 1) {
                fail(422, {
                    action: "settings",
                    error: "Unable to switch list mode",
                    errors: [{ field: "listMode", message: "" }]
                });
            }
        }

        await writeConfig(newConfig, params.groupId);

        if (changingToRegistry) {
            // make all lists public in the group (should only be one)
            await client.list.updateMany({
                data: {
                    public: true
                },
                where: {
                    groupId: params.groupId
                }
            });
        }

        return { success: true };
    }
};
