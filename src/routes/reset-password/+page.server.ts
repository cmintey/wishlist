import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { hashToken } from "$lib/server/token";
import { resetPasswordSchema } from "$lib/validations";
import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request }) => {
	const url = new URL(request.url);
	const token = url.searchParams.get("token");

	if (token) {
		const reset = await client.passwordReset.findFirst({
			where: {
				hashedToken: hashToken(token),
				redeemed: false
			},
			select: {
				id: true,
				userId: true,
				createdAt: true,
				expiresIn: true
			}
		});

		if (!reset) throw error(400, "reset token not found");

		const createdAt = reset.createdAt;
		const expiry = createdAt.getTime() + reset.expiresIn;
		if (expiry - Date.now() > 0) {
			return { valid: true, userId: reset.userId, id: reset.id };
		}
	}

	return { valid: false };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const schema = resetPasswordSchema.and(
			z.object({
				userId: z.string().cuid(),
				id: z.coerce.number().int().min(1)
			})
		);
		const pwdData = schema.safeParse({ ...formData, oldPassword: "reset" });

		if (!pwdData.success) {
			const errors = pwdData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		const user = await client.user.findUnique({
			where: {
				id: pwdData.data.userId
			},
			select: {
				id: true,
				username: true
			}
		});

		if (user) {
			try {
				await auth.updateKeyPassword("username", user.username, pwdData.data.newPassword);
				await client.passwordReset.update({
					where: {
						id: pwdData.data.id
					},
					data: {
						redeemed: true
					}
				});
				return { success: true };
			} catch {
				return fail(400, {
					error: true,
					errors: [{ field: "newPassword", message: "Unable to update password" }]
				});
			}
		}

		return { success: false };
	}
};
