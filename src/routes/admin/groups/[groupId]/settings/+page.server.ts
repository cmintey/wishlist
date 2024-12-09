import { Role } from "$lib/schema";
import { getConfig, writeConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect, error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { settingSchema } from "$lib/validations";
import { getFormatter } from "$lib/i18n";

export const load = (async ({ locals, params }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        redirect(302, `/login?ref=/admin/groups/${params.groupId}`);
    }

    const userGroupRoleId = await client.userGroupMembership.findFirst({
        where: {
            userId: locals.user.id,
            groupId: params.groupId
        },
        select: {
            roleId: true
        }
    });

    if (!(locals.user.roleId === Role.ADMIN || userGroupRoleId?.roleId === Role.GROUP_MANAGER)) {
        error(401, $t("errors.not-authorized"));
    }

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
        const formData = Object.fromEntries(await request.formData());
        const groupSettingSchema = settingSchema.pick({
            suggestionMethod: true,
            enableSuggestions: true,
            claimsShowName: true,
            listMode: true
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
            listMode: configData.data.listMode
        };
        await writeConfig(newConfig, params.groupId);

        return { success: true };
    }
};
