import { client } from "./prisma";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { User } from "$lib/generated/prisma/client";

const API_KEY_PREFIX = "wl_";

/**
 * Generate a new API key
 * Returns the raw key (only shown once) and the created record
 */
export async function generateApiKey(userId: string, name: string, expiresAt?: Date) {
    // Generate a random key
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const rawKey = API_KEY_PREFIX + encodeHexLowerCase(bytes);
    
    // Hash it for storage
    const keyHash = encodeHexLowerCase(sha256(new TextEncoder().encode(rawKey)));
    
    // Store first 12 chars for display
    const keyPrefix = rawKey.substring(0, 12);
    
    const apiKey = await client.apiKey.create({
        data: {
            name,
            keyHash,
            keyPrefix,
            userId,
            expiresAt
        }
    });
    
    return {
        key: rawKey,
        apiKey
    };
}

/**
 * Validate an API key and return the associated user
 */
export async function validateApiKey(rawKey: string): Promise<ApiKeyValidationResult> {
    if (!rawKey.startsWith(API_KEY_PREFIX)) {
        return { valid: false, user: null, apiKey: null };
    }
    
    const keyHash = encodeHexLowerCase(sha256(new TextEncoder().encode(rawKey)));
    
    const apiKey = await client.apiKey.findUnique({
        where: { keyHash },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    roleId: true,
                    picture: true,
                    oauthId: true,
                    preferredLanguage: true
                }
            }
        }
    });
    
    if (!apiKey) {
        return { valid: false, user: null, apiKey: null };
    }
    
    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return { valid: false, user: null, apiKey: null };
    }
    
    // Update last used timestamp (don't await, fire and forget)
    client.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() }
    }).catch(() => {});
    
    return {
        valid: true,
        user: apiKey.user,
        apiKey: {
            id: apiKey.id,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix
        }
    };
}

/**
 * List all API keys for a user
 */
export async function listApiKeys(userId: string) {
    return client.apiKey.findMany({
        where: { userId },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            createdAt: true,
            lastUsedAt: true,
            expiresAt: true
        },
        orderBy: { createdAt: "desc" }
    });
}

/**
 * Delete an API key
 */
export async function deleteApiKey(id: string, userId: string) {
    return client.apiKey.deleteMany({
        where: { id, userId }
    });
}

export type ApiKeyValidationResult = 
    | { valid: true; user: Omit<User, "hashedPassword">; apiKey: { id: string; name: string; keyPrefix: string } }
    | { valid: false; user: null; apiKey: null };
