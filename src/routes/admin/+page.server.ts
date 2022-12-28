import { SMTP_ENABLED } from "$lib/server/email";
import { client } from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin`);
	}
	if (user.roleId != 2) {
		throw error(401, "Not authorized to view admin panel");
	}

	const users = await client.user.findMany({
		select: {
			username: true,
			name: true,
			role: {
				select: {
					name: true
				}
			}
		}
	});

	return { user, users, smtpEnabled: SMTP_ENABLED };
};
