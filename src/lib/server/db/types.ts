import type { Insertable } from "kysely";
import type { Updateable } from "kysely";
import type { Selectable } from "kysely";
import type { Generated } from "kysely";

interface _PrismaMigrations {
    applied_steps_count: Generated<string>;
    checksum: string;
    finished_at: Date | null;
    id: string;
    logs: string | null;
    migration_name: string;
    rolled_back_at: Date | null;
    started_at: Generated<Date>;
}

/** Tables **/
interface GroupTable {
    id: string;
    name: string;
}

interface ItemPriceTable {
    currency: string;
    id: string;
    value: number;
}

interface ItemTable {
    createdById: string;
    id: Generated<number>;
    imageUrl: string | null;
    itemPriceId: string | null;
    name: string;
    note: string | null;
    price: string | null;
    quantity: number | null;
    url: string | null;
    userId: string;
}

interface ListTable {
    groupId: string;
    icon: string | null;
    iconColor: string | null;
    id: string;
    name: string | null;
    ownerId: string;
    public: Generated<boolean>;
}

interface ListItemTable {
    addedById: string;
    approved: Generated<boolean>;
    displayOrder: number | null;
    id: string;
    itemId: number;
    listId: string;
}

interface ListItemClaimTable {
    claimedById: string | null;
    id: string;
    itemId: number;
    listId: string;
    publicClaimedById: string | null;
    purchased: Generated<boolean>;
    quantity: Generated<number>;
}

interface PasswordResetTable {
    createdAt: Generated<Date>;
    hashedToken: string;
    id: string;
    redeemed: Generated<boolean>;
    userId: string;
}

interface PatchTable {
    executed_at: Generated<Date>;
    id: string;
}

interface RoleTable {
    id: Generated<number>;
    name: string;
}

interface SessionTable {
    expiresAt: Date;
    id: string;
    userId: string;
}

interface SignupTokenTable {
    createdAt: Generated<Date>;
    groupId: Generated<string>;
    hashedToken: string;
    id: string;
    redeemed: Generated<boolean>;
}

interface SystemConfigTable {
    groupId: string;
    key: string;
    value: string | null;
}

interface SystemUserTable {
    id: string;
    name: Generated<string | null>;
    username: string;
}

interface UserTable {
    email: Generated<string>;
    hashedPassword: string;
    id: string;
    name: string;
    oauthId: string | null;
    picture: string | null;
    roleId: Generated<number>;
    username: string;
    preferredLanguage: string | null;
}

interface UserGroupMembershipTable {
    active: Generated<boolean>;
    groupId: string;
    id: string;
    roleId: Generated<number>;
    userId: string;
}

/** Wrapper Objects **/
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type List = Selectable<ListTable>;
export type NewList = Insertable<ListTable>;
export type ListUpdate = Updateable<ListTable>;

export type SystemUser = Selectable<SystemUserTable>;
export type NewSystemUser = Insertable<SystemUserTable>;
export type SystemUserUpdate = Updateable<SystemUserTable>;

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;

export type SignupToken = Selectable<SignupTokenTable>;
export type NewSignupToken = Insertable<SignupTokenTable>;
export type SignupTokenUpdate = Updateable<SignupTokenTable>;

export type UserGroupMembership = Selectable<UserGroupMembershipTable>;
export type NewUserGroupMembership = Insertable<UserGroupMembershipTable>;
export type UserGroupMembershipUpdate = Updateable<UserGroupMembershipTable>;

export interface DB {
    _prisma_migrations: _PrismaMigrations;
    group: GroupTable;
    item_price: ItemPriceTable;
    items: ItemTable;
    list: ListTable;
    list_item: ListItemTable;
    list_item_claim: ListItemClaimTable;
    password_resets: PasswordResetTable;
    patch: PatchTable;
    role: RoleTable;
    session: SessionTable;
    signup_tokens: SignupTokenTable;
    system_config: SystemConfigTable;
    system_user: SystemUserTable;
    user: UserTable;
    user_group_membership: UserGroupMembershipTable;
}
