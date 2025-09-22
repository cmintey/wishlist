import cuid2 from "@paralleldrive/cuid2";
import { db } from ".";
import type { NewUser, UserUpdate } from "./types";

class UserRepository {
    private readonly selectFrom = db.selectFrom("user");

    async update(id: string, user: UserUpdate) {
        return db.updateTable("user").set(user).where("id", "=", id).executeTakeFirst();
    }

    async create(user: Omit<NewUser, "id">) {
        const id = cuid2.createId();
        return db
            .insertInto("user")
            .values({ id, ...user })
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    async findByUsername(username: string) {
        return this.selectFrom.selectAll().where("username", "=", username).executeTakeFirst();
    }

    async count() {
        return this.selectFrom
            .select(({ fn }) => fn.countAll<number>().as("count"))
            .executeTakeFirst()
            .then((res) => res?.count || 0);
    }
}

export const userRepository = new UserRepository();
