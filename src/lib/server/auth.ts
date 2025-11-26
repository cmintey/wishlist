import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { error, redirect, type Cookies } from "@sveltejs/kit";
import { getRequestEvent } from "$app/server";
import { getFormatter } from "$lib/server/i18n";
import { Role } from "$lib/schema";
import { type Session, type User } from "./db";
import { logger } from "./logger";
import { sessionRepository } from "./db/session.repository";
import { userRepository } from "./db/user.repository";
import { userGroupRepository } from "./db/userGroup.repository";

const origin = new URL(env.ORIGIN || "localhost:3280");

export const sessionCookieName = "wishlist_session";

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
    return sessionRepository.create(token, userId);
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const session = await sessionRepository.findByToken(token);
    if (!session) {
        return { session: null, user: null };
    }

    const user = await userRepository.findById(session.userId);
    if (!user) {
        logger.warn({ userId: session.userId }, "No user found for session");
        return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime()) {
        await sessionRepository.delete(session);
        return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - sessionRepository.REFRESH_TIME) {
        const refreshedSession = await sessionRepository.refresh(session);
        return { session: refreshedSession, user };
    }
    return { session, user };
}

export async function invalidateSession(sessionId: string) {
    await sessionRepository.deleteById(sessionId);
}

export async function invalidateUserSessions(userId: string) {
    await sessionRepository.deleteAllByUserId(userId);
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

    const userGroupMembership = await userGroupRepository.find(user.id, groupId);
    if (userGroupMembership && userGroupMembership.roleId === Role.GROUP_MANAGER) {
        return user;
    }

    const { locals } = getRequestEvent();
    const $t = await getFormatter(locals.locale);
    error(401, $t("errors.not-authorized"));
}
