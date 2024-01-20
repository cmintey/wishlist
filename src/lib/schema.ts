export enum Role {
    USER = 1,
    ADMIN,
    GROUP_MANAGER
}

export const SSEvents = {
    item: {
        update: "item_update",
        create: "item_create",
        delete: "item_delete"
    }
};
