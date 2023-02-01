import { auth } from "$lib/server/auth";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals }) => {
	const session = await locals.validate();
	if (!session) return new Response(null, { status: 401 });
	await auth.invalidateSession(session.sessionId); // invalidate session
	locals.setSession(null); // remove cookie
	return new Response(null, { status: 201 });
};
