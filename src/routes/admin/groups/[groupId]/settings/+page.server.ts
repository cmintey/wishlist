import { getConfig, writeConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { settingSchema } from "$lib/validations";
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

    const [membershipCount, config] = await Promise.all([
        await client.userGroupMembership.count({
            where: {
                groupId: group.id
            }
        }),
        getConfig(group.id)
    ]);

    return {
        config,
        membershipCount
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
            return fail(400, { action: "settings", error: true, errors });
        }

        const newConfig: Partial<Config> = {
            suggestions: {
                enable: configData.data.enableSuggestions,
                method: configData.data.suggestionMethod
            },
            claims: {
                showName: configData.data.claimsShowName
            },
            listMode: configData.data.listMode,
            enableDefaultListCreation: configData.data.enableDefaultListCreation,
            allowPublicLists: configData.data.allowPublicLists
        };
        await writeConfig(newConfig, params.groupId);

        return { success: true };
    }
};
