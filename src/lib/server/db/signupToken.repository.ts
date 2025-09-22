import { db, type NewSignupToken, type SignupTokenUpdate } from ".";

class SignupTokenRepository {
    private readonly selectFrom = db.selectFrom("signup_tokens");

    async findByHashedTokenAndNotRedeemed(hashedToken: string) {
        return this.selectFrom
            .selectAll()
            .where("hashedToken", "=", hashedToken)
            .where("redeemed", "=", false)
            .executeTakeFirst();
    }

    async findById(id: string) {
        return this.selectFrom.selectAll().where("id", "=", id).executeTakeFirst();
    }

    async update(id: string, data: SignupTokenUpdate) {
        return db.updateTable("signup_tokens").set(data).where("id", "=", id).execute();
    }
}

export const signupTokenRepository = new SignupTokenRepository();
