import type { RequestHandler } from "./$types";
import { authorizeRedirect } from "#lib/server/openid.js";

export const GET: RequestHandler = authorizeRedirect;
