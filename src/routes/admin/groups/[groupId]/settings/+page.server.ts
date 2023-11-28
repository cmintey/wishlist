import { Role } from "$lib/schema";
import { getConfig, writeConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect, error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { settingSchema } from "$lib/validations";

export const load = (async ({ locals, params }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(302, `/login?ref=/admin/groups/${params.groupId}`);
	}

	const userGroupRoleId = await client.userGroupMembership.findFirst({
		where: {
			userId: session.user.userId,
			groupId: params.groupId
		},
		select: {
			roleId: true
		}
	});

	if (!(session.user.roleId === Role.ADMIN || userGroupRoleId?.roleId === Role.GROUP_MANAGER)) {
		throw error(401, "Not authorized to view admin panel");
	}

	const group = await client.group.findUniqueOrThrow({
		where: {
			id: params.groupId
		},
		select: {
			id: true
		}
	});

	return {
		config: getConfig(group.id)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = Object.fromEntries(await request.formData());
		const groupSettingSchema = settingSchema.pick({
			suggestionMethod: true,
			enableSuggestions: true,
			claimsShowName: true
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
			}
		};
		await writeConfig(newConfig, params.groupId);

		return { success: true };
	}
};
