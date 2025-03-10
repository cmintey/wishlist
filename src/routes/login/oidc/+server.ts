import type { RequestHandler } from "./$types";
import { authorizeRedirect } from "$lib/server/openid";

export const GET: RequestHandler = authorizeRedirect;
