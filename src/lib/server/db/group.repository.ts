import { db } from ".";

class GroupRepository {
    private readonly selectFrom = db.selectFrom("group");

    async findAny() {
        return this.selectFrom.selectAll().limit(1).executeTakeFirst();
    }

    async findAll() {
        return this.selectFrom.selectAll().execute();
    }
}

export const groupRepository = new GroupRepository();
