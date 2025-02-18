import type { ItemOnListDTO } from "$lib/dtos/item-dto";
import type {
    Item,
    ListItem as PrismaListItem,
    ItemClaim as PrismaItemClaim,
    ItemPrice,
    User,
    SystemUser
} from "@prisma/client";

type MinimalUser = Pick<User, "id" | "name">;

interface ItemClaim extends Pick<PrismaItemClaim, "id" | "purchased"> {
    claimedBy: MinimalUser | null;
    publicClaimedBy: Pick<SystemUser, "id" | "name"> | null;
}

interface ListItem extends Pick<PrismaListItem, "listId" | "approved" | "displayOrder"> {
    addedBy: MinimalUser;
    itemClaims: ItemClaim[];
}

export interface FullItem extends Item {
    itemPrice: ItemPrice | null;
    user: MinimalUser;
    lists: ListItem[];
}

export const toItemOnListDTO = (item: FullItem, listId: string) => {
    const { lists, ...restOfItem } = item;
    const list = lists.find((l) => l.listId === listId);
    if (!list) {
        throw new Error(`Couldn't find related list with id=${listId} on item with id=${item.id}`);
    }
    const { itemClaims, ...restOfList } = list;
    return {
        ...restOfItem,
        ...restOfList,
        claims: itemClaims.map((claim) =>
            claim.claimedBy
                ? { claimId: claim.id, claimedBy: claim.claimedBy, purchased: claim.purchased }
                : { claimId: claim.id, publicClaimedBy: claim.publicClaimedBy! }
        )
    } satisfies ItemOnListDTO;
};
