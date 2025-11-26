import { db, type PasswordResetUpdate } from ".";
import { hashToken } from "../token";

class PasswordResetRepository {
    async findByToken(token: string) {
        const hashedToken = hashToken(token);
        return db.selectFrom("password_resets").selectAll().where("hashedToken", "=", hashedToken).executeTakeFirst();
    }

    async update(id: string, data: PasswordResetUpdate) {
        return db.updateTable("password_resets").set(data).where("id", "=", id).execute();
    }
}

export const passwordResetRepository = new PasswordResetRepository();
