import { dev } from "$app/environment";
import { client } from "./prisma";
import { env } from "$env/dynamic/private";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { Session, User } from "@prisma/client";
import { sha256 } from "@oslojs/crypto/sha2";
import { error, redirect, type Cookies } from "@sveltejs/kit";
import { getRequestEvent } from "$app/server";
import { getFormatter } from "$lib/i18n";
import { Role } from "$lib/schema";

const EXPIRES_IN = 1000 * 60 * 60 * 24 * 30; // 30 days
const REFRESH_TIME = 1000 * 60 * 60 * 24 * 15; // 15 days
const origin = new URL(env.ORIGIN || "localhost:3280");

export const sessionCookieName = "wishlist_session";

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + EXPIRES_IN)
    };
    await client.session.create({
        data: session
    });
    return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const result = await client.session.findUnique({
        where: {
            id: sessionId
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    roleId: true,
                    picture: true,
                    oauthId: true
                }
            }
        }
    });
    if (result === null) {
        return { session: null, user: null };
    }
    const { user, ...session } = result;
    if (Date.now() >= session.expiresAt.getTime()) {
        await client.session.delete({ where: { id: sessionId } });
        return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - REFRESH_TIME) {
        session.expiresAt = new Date(Date.now() + EXPIRES_IN);
        await client.session.update({
            where: {
                id: session.id
            },
            data: {
                expiresAt: session.expiresAt
            }
        });
    }
    return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await client.session.delete({ where: { id: sessionId } });
}

export async function invalidateUserSessions(userId: string): Promise<void> {
    await client.session.deleteMany({ where: { userId } });
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date): void {
    cookies.set(sessionCookieName, token, {
        httpOnly: true,
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
        secure: !dev && origin.protocol === "https:"
    });
}

export function deleteSessionTokenCookie(cookies: Cookies): void {
    cookies.set(sessionCookieName, "", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0,
        path: "/",
        secure: !dev && origin.protocol === "https:"
    });
}

export type SessionValidationResult =
    | { session: Session; user: Omit<User, "hashedPassword"> }
    | { session: null; user: null };

export function requireLogin() {
    const { locals, url } = getRequestEvent();

    if (!locals.user) {
        const redirectTo = url.pathname + url.search;
        const params = new URLSearchParams({ redirectTo });

        redirect(307, `/login?${params}`);
    }

    return locals.user;
}

export async function requireLoginOrError() {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        const $t = await getFormatter(locals.locale);
        error(401, $t("errors.unauthenticated"));
    }

    return locals.user;
}

export async function requireRole(role: Role) {
    const user = requireLogin();
    const { locals } = getRequestEvent();
    if (user.roleId !== role) {
        const $t = await getFormatter(locals.locale);
        error(401, $t("errors.not-authorized"));
    }
    return user;
}

export async function requireAdminOrManager(groupId: string) {
    const user = requireLogin();
    if (user.roleId === Role.ADMIN) {
        return user;
    }

    const userGroupMembership = await client.userGroupMembership.findFirst({
        where: {
            userId: user.id,
            groupId: groupId
        },
        select: {
            roleId: true
        }
    });

    if (userGroupMembership && userGroupMembership.roleId === Role.GROUP_MANAGER) {
        return user;
    }

    const { locals } = getRequestEvent();
    const $t = await getFormatter(locals.locale);
    error(401, $t("errors.not-authorized"));
}
