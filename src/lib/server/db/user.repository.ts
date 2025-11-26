import { createId } from "@paralleldrive/cuid2";
import { db } from ".";
import type { NewUser, User, UserUpdate } from "./types";

class UserRepository {
    private readonly selectFrom = db.selectFrom("user");

    async update(id: string, user: UserUpdate) {
        return db.updateTable("user").set(user).where("id", "=", id).executeTakeFirst();
    }

    async create(user: Omit<NewUser, "id">) {
        const id = createId();
        return db
            .insertInto("user")
            .values({ id, ...user })
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    async findByUsername(username: string) {
        return this.selectFrom.select("id").where("username", "=", username).executeTakeFirst();
    }

    async findById(id: string) {
        return db
            .selectFrom("user")
            .select(["id", "username", "email", "name", "roleId", "picture", "oauthId", "preferredLanguage"])
            .where("id", "=", id)
            .executeTakeFirst();
    }

    async count() {
        return this.selectFrom
            .select(({ fn }) => fn.countAll<number>().as("count"))
            .executeTakeFirst()
            .then((res) => res?.count || 0);
    }
}

export const userRepository = new UserRepository();
