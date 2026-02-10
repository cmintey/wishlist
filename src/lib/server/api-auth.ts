import { validateApiKey } from "$lib/server/api-keys";
import { json, type RequestEvent } from "@sveltejs/kit";
import type { User } from "$lib/generated/prisma/client";

export type ApiContext = {
    user: User;
};

/**
 * Validates API key from Authorization header and returns the user
 * Authorization: Bearer wl_xxxxxxxxxxxx
 */
export async function authenticateApiRequest(event: RequestEvent): Promise<{ user: User } | Response> {
    const authHeader = event.request.headers.get("Authorization");
    
    if (!authHeader) {
        return json({ error: "Missing Authorization header" }, { status: 401 });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return json({ error: "Invalid Authorization header format. Expected: Bearer <api_key>" }, { status: 401 });
    }

    const apiKey = authHeader.slice(7); // Remove "Bearer " prefix
    
    if (!apiKey) {
        return json({ error: "Missing API key" }, { status: 401 });
    }

    const result = await validateApiKey(apiKey);
    
    if (!result.valid || !result.user) {
        return json({ error: "Invalid or expired API key" }, { status: 401 });
    }

    return { user: result.user };
}

/**
 * Helper to check if the result is a Response (error) or the context (success)
 */
export function isApiError(result: { user: User } | Response): result is Response {
    return result instanceof Response;
}
