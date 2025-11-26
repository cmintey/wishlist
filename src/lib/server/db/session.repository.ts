import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { db } from ".";
import type { NewSession, Session } from "./types";

class SessionRepository {
    public readonly EXPIRES_IN = 1000 * 60 * 60 * 24 * 30; // 30 days
    public readonly REFRESH_TIME = 1000 * 60 * 60 * 24 * 15; // 15 days

    async create(token: string, userId: string) {
        const sessionId = this.encodeToken(token);
        const session: NewSession = {
            id: sessionId,
            userId,
            expiresAt: new Date(Date.now() + this.EXPIRES_IN)
        };
        await db.insertInto("session").values(session).execute();
        return session;
    }

    async findByToken(token: string) {
        const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
        const session = await db.selectFrom("session").selectAll().where("id", "=", sessionId).executeTakeFirst();
        if (!session) {
            return undefined;
        }
        // TODO: Temporary hack since prisma stores dates as timestamps in Sqlite
        return {
            ...session,
            expiresAt: new Date(session.expiresAt)
        };
    }

    async delete(session: Session) {
        await this.deleteById(session.id);
    }

    async deleteById(id: string) {
        await db.deleteFrom("session").where("id", "=", id).execute();
    }

    async deleteAllByUserId(userId: string) {
        await db.deleteFrom("session").where("userId", "=", userId).execute();
    }

    async refresh(session: Session): Promise<Session> {
        const newExpiryDate = new Date(Date.now() + this.EXPIRES_IN);
        await db.updateTable("session").set({ expiresAt: newExpiryDate }).where("id", "=", session.id).execute();
        return {
            ...session,
            expiresAt: newExpiryDate
        };
    }

    private encodeToken(token: string) {
        return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    }
}

export const sessionRepository = new SessionRepository();
