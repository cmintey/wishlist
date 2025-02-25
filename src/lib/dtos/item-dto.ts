import type { Item, ItemPrice, SystemUser, User } from "@prisma/client";

type MinimalUser = Pick<User, "id" | "name">;

interface UserWithGroups extends MinimalUser {
    groups: string[];
}

type Claimed = {
    claimId: string;
    claimedBy: UserWithGroups;
    publicClaimedBy: undefined;
    purchased: boolean;
};

type PubliclyClaimed = {
    claimId: string;
    claimedBy: undefined;
    publicClaimedBy: Pick<SystemUser, "id" | "name">;
    purchased: undefined;
};

export type ClaimDTO = Claimed | PubliclyClaimed;

interface ListItem {
    listId: string;
    addedBy: MinimalUser;
    approved: boolean;
    displayOrder: number | null;
    claims: ClaimDTO[];
}

export interface ItemOnListDTO extends Item, ListItem {
    itemPrice: ItemPrice | null;
    user: MinimalUser;
    listCount: number;
}

export interface ItemDTO extends Item {
    itemPrice: ItemPrice | null;
    user: MinimalUser;
    lists: ListItem[];
}
