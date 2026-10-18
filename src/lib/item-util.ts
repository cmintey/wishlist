import type { ItemOnListDTO } from "./dtos/item-dto";

interface ItemWithLists extends Pick<ItemOnListDTO, "user" | "createdById"> {
    lists: Pick<ItemOnListDTO, "list">[];
}

export function userCanEditOnSomeList(item: ItemWithLists, userId: string | undefined) {
    if (!userId) return false;
    if (itemIsForUser(item, userId) || itemCreatedByUser(item, userId)) {
        return true;
    }
    for (const list of item.lists) {
        if (itemIsOnListOwnedByUser({ ...list }, userId) || itemIsOnListManagedByUser({ ...list }, userId)) {
            return true;
        }
    }

    return false;
}

export function userCanEdit(item: ItemOnListDTO, userId: string | undefined) {
    if (!userId) return false;
    return (
        itemIsForUser(item, userId) ||
        itemCreatedByUser(item, userId) ||
        itemIsOnListOwnedByUser(item, userId) ||
        itemIsOnListManagedByUser(item, userId)
    );
}

function itemIsForUser(item: Pick<ItemOnListDTO, "user">, userId: string) {
    return item.user.id === userId;
}

function itemCreatedByUser(item: Pick<ItemOnListDTO, "createdById">, userId: string) {
    return item.createdById === userId;
}

function itemIsOnListOwnedByUser(item: Pick<ItemOnListDTO, "list">, userId: string) {
    return item.list.ownerId === userId;
}

function itemIsOnListManagedByUser(item: Pick<ItemOnListDTO, "list">, userId: string) {
    return item.list.managers.find(({ userId: managerId }) => managerId === userId) !== undefined;
}
