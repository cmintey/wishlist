import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { resetPasswordSchema } from "$lib/validations/schemas";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { fail, redirect } from "@sveltejs/kit";
import { writeFileSync } from "fs";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/account`);
	}

	return {
		user
	};
};

export const actions: Actions = {
	profile: async ({ request, locals }) => {
		const { user, session } = await locals.validateUser();
		if (!session) throw redirect(302, "/login?ref=/account");

		const formData = Object.fromEntries(await request.formData());
		const schema = z.object({
			name: z.string().trim().min(1, "Name must not be blank"),
			username: z.string().trim().min(1, "Username must not be blank"),
			email: z.string().email()
		});
		const nameData = schema.safeParse(formData);
		// check for empty values
		if (!nameData.success) {
			const errors = nameData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		try {
			await client.authUser.update({
				data: {
					name: nameData.data.name,
					username: nameData.data.username,
					email: nameData.data.email
				},
				where: {
					username: user.username
				}
			});
		} catch (e) {
			const err = e as PrismaClientKnownRequestError;
			console.log(e);
			const targets = err.meta?.target as string[];
			return fail(400, {
				error: true,
				errors: [{ field: targets[0], message: `${targets[0]} already in use` }]
			});
		}
	},

	profilePicture: async ({ request, locals }) => {
		const { user, session } = await locals.validateUser();
		if (!session) throw redirect(302, "/login?ref=/account");

		const form = await request.formData();
		const image = form.get("profilePic") as File;

		let filename = null;

		const create_image = image.size > 0 && image.size <= 5000000;

		if (create_image) {
			const ext = image.name.split(".").pop();
			filename = user?.username + "-" + Date.now().toString() + "." + ext;

			const ab = await image.arrayBuffer();

			writeFileSync(`uploads/${filename}`, Buffer.from(ab));
			console.log("wrote image");
		}

		if (filename) {
			await client.authUser.update({
				where: {
					id: user.userId
				},
				data: {
					picture: filename
				}
			});
		}
	},

	passwordchange: async ({ request, locals }) => {
		const { user, session } = await locals.validateUser();
		if (!session) throw redirect(302, "/login?ref=/account");

		const formData = Object.fromEntries(await request.formData());
		const pwdData = resetPasswordSchema.safeParse(formData);

		if (!pwdData.success) {
			const errors = pwdData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		try {
			await auth.useKey("username", user.username, pwdData.data.oldPassword);
		} catch {
			return fail(400, {
				error: true,
				errors: [{ field: "currentPassword", message: "Incorrect password" }]
			});
		}

		try {
			await auth.updateKeyPassword("username", user.username, pwdData.data.newPassword);
		} catch {
			return fail(400, {
				error: true,
				errors: [{ field: "newPassword", message: "Unable to update password" }]
			});
		}
	}
};
