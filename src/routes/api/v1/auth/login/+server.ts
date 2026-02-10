import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { client } from "$lib/server/prisma";
import { verifyPasswordHash } from "$lib/server/password";
import { generateApiKey } from "$lib/server/api-keys";
import { getConfig } from "$lib/server/config";

const EXTENSION_API_KEY_NAME = "Browser Extension (auto)";

/**
 * POST /api/v1/auth/login
 * Authenticate with username/password and return an API key
 * 
 * This endpoint is designed for browser extensions and mobile apps
 * to simplify the authentication flow. Instead of manually creating
 * an API key, users can just log in with their credentials.
 */
export const POST: RequestHandler = async ({ request }) => {
    const config = await getConfig();
    
    // Check if password login is disabled
    if (config.security.disablePasswordLogin) {
        return json({ error: "Password login is disabled on this server" }, { status: 403 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, password } = body;

    if (!username || !password) {
        return json({ error: "Username and password are required" }, { status: 400 });
    }

    try {
        // Find the user
        const user = await client.user.findUnique({
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                hashedPassword: true
            },
            where: {
                username: username
            }
        });

        if (!user) {
            return json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Verify password
        const isValid = await verifyPasswordHash(user.hashedPassword, password);
        if (!isValid) {
            return json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Check if user already has an extension API key
        let existingKey = await client.apiKey.findFirst({
            where: {
                userId: user.id,
                name: EXTENSION_API_KEY_NAME
            },
            select: {
                id: true,
                keyPrefix: true,
                expiresAt: true
            }
        });

        // If key exists and is expired, delete it
        if (existingKey?.expiresAt && existingKey.expiresAt < new Date()) {
            await client.apiKey.delete({ where: { id: existingKey.id } });
            existingKey = null;
        }

        // If key exists and is valid, we can't return the original key (it's hashed)
        // So we delete it and create a new one
        if (existingKey) {
            await client.apiKey.delete({ where: { id: existingKey.id } });
        }

        // Create a new API key for the extension (no expiration)
        const { key, apiKey } = await generateApiKey(user.id, EXTENSION_API_KEY_NAME);

        return json({
            success: true,
            apiKey: key,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        return json({ error: "Authentication failed" }, { status: 500 });
    }
};
