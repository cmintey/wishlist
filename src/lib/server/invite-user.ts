import { fail, type RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import { getConfig } from "./config";
import { sendSignupLink } from "./email";
import { client } from "./prisma";
import generateToken, { hashToken } from "./token";

export const inviteUser = async ({ url, request }: RequestEvent) => {
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
		"invite-group": z.string().min(1)
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
};
