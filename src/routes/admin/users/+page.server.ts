import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect, error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { sendSignupLink } from "$lib/server/email";
import generateToken, { hashToken } from "$lib/server/token";
import { z } from "zod";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin/users`);
	}
	if (user.roleId !== Role.ADMIN) {
		throw error(401, "Not authorized to view admin panel");
	}

	const users = await client.authUser.findMany({
		select: {
			username: true,
			name: true,
			email: true,
			role: {
				select: {
					id: true
				}
			},
			UserGroupMembership: {
				select: {
					group: {
						select: {
							name: true
						}
					}
				}
			}
		}
	});

	const groups = client.group.findMany();

	const config = getConfig();

	return {
		user: {
			isAdmin: true,
			...user
		},
		users: users.map((user) => ({
			isAdmin: user.role.id === Role.ADMIN,
			groups: user.UserGroupMembership.map(({ group }) => group.name),
			...user
		})),
		config,
		groups
	};
};

export const actions: Actions = {
	default: async ({ url, request }) => {
		const token = await generateToken();
		const tokenUrl = new URL(`/signup?token=${token}`, url);

		const config = await getConfig();

		if (!config.smtp.enable) {
			await client.signupToken.create({
				data: {
					hashedToken: hashToken(token),
					expiresIn: 21600000 // 6 hours in milliseconds
				}
			});

			return { action: "invite-email", success: true, url: tokenUrl.href };
		}

		const formData = Object.fromEntries(await request.formData());
		const schema = z.object({
			"invite-email": z.string().email(),
			"invite-group": z.string().nonempty()
		});

		const emailData = schema.safeParse(formData);

		if (!emailData.success) {
			const errors = emailData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { action: "invite-email", error: true, errors });
		}

		await client.signupToken.create({
			data: {
				hashedToken: hashToken(token),
				expiresIn: 21600000, // 6 hours in milliseconds
				groupId: emailData.data["invite-group"]
			}
		});

		await sendSignupLink(emailData.data["invite-email"], tokenUrl.href);
		return { action: "invite-email", success: true, url: null };
	}
};
