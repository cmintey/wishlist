import { db, type NewUserGroupMembership, type UserGroupMembershipUpdate } from ".";

class UserGroupRepository {
    async create(userGroup: NewUserGroupMembership) {
        await db.insertInto("user_group_membership").values(userGroup).execute();
    }

    async find(userId: string, groupId: string) {
        return db
            .selectFrom("user_group_membership")
            .selectAll()
            .where("userId", "=", userId)
            .where("groupId", "=", groupId)
            .executeTakeFirst();
    }

    async findActive(userId: string) {
        return db
            .selectFrom("user_group_membership")
            .selectAll()
            .where("userId", "=", userId)
            .where("active", "=", true)
            .executeTakeFirst();
    }

    async findAllByUserId(userId: string) {
        return db.selectFrom("user_group_membership").selectAll().where("userId", "=", userId).executeTakeFirst();
    }

    async findGroupsByUserId(userId: string) {
        return db
            .selectFrom("user_group_membership as m")
            .innerJoin("group as g", "g.id", "m.groupId")
            .select(["g.id", "g.name", "m.roleId", "m.active"])
            .where("userId", "=", userId)
            .execute();
    }

    async update(id: string, data: UserGroupMembershipUpdate) {
        return await db
            .updateTable("user_group_membership")
            .set(data)
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
}

export const userGroupRepository = new UserGroupRepository();
