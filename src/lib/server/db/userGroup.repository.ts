import { db, type NewUserGroupMembership } from ".";

class UserGroupRepository {
    async create(userGroup: NewUserGroupMembership) {
        await db.insertInto("user_group_membership").values(userGroup).execute();
    }
}

export const userGroupRepository = new UserGroupRepository();
