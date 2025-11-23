import type { ItemOnListDTO } from "$lib/dtos/item-dto";

export const claimFilter = (filter: string | null, userId: string | null) => {
    if (filter === "unclaimed") {
        return (item: ItemOnListDTO) => item.isClaimable;
    } else if (filter === "claimed") {
        return (item: ItemOnListDTO) => {
            const userHasClaimed = item.claims.find((c) => userId && c.claimedBy?.id === userId);
            return (!item.isClaimable || userHasClaimed) && item.archivedById === null;
        };
    } else if (filter === "archived") {
        return (item: ItemOnListDTO) => item.archivedById !== null;
    }
    return (_item: ItemOnListDTO) => true;
};

export const decodeMultiValueFilter = (filter: string | null) => {
    if (filter === null) {
        return [] as string[];
    }
    return decodeURIComponent(filter).split(",");
};
