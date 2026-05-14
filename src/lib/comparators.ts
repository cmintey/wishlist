import type { ItemOnListDTO } from "./dtos/item-dto";

export function comparePrice(a: ItemOnListDTO, b: ItemOnListDTO, opts?: { reversed?: boolean; nullsLast?: boolean }) {
    if (a.itemPrice === null && b.itemPrice === null) return 0;
    if (a.itemPrice === null) return opts?.reversed && !opts?.nullsLast ? -1 : 1;
    if (b.itemPrice === null) return opts?.reversed && !opts?.nullsLast ? 1 : -1;
    const comp = a.itemPrice.value - b.itemPrice.value;
    return opts?.reversed ? -comp : comp;
}

export function compareDisplayOrder(a: ItemOnListDTO, b: ItemOnListDTO) {
    return (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity);
}

export function compareClaimStatus(a: ItemOnListDTO, b: ItemOnListDTO, userId?: string) {
    const userHasClaimedA = a.claims.find((c) => userId && c.claimedBy?.id === userId);
    const userHasClaimedB = a.claims.find((c) => userId && c.claimedBy?.id === userId);
    if (a.isClaimable && !userHasClaimedA && !(b.isClaimable && !userHasClaimedB)) {
        return -1;
    } else if (!(a.isClaimable && !userHasClaimedA) && b.isClaimable && !userHasClaimedB) {
        return 1;
    } else {
        return 0;
    }
}
