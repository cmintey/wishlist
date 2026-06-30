import type { ItemOnListDTO } from "./dtos/item-dto";

interface SortOptions {
    sort: string | null;
    dir: string | null;
    userId?: string | null;
    listOwnerId: string;
}

export function itemSorter(opts: SortOptions) {
    return (a: ItemOnListDTO, b: ItemOnListDTO) => {
        // Don't perform claim status sorting if on your own list
        if (opts.listOwnerId !== opts.userId) {
            const claimStatus = compareClaimStatus(a, b, opts.userId);
            if (claimStatus != 0) return claimStatus;
        }

        if (opts.sort === "price") {
            const reversed = opts.dir === "desc";
            const price = comparePrice(a, b, { reversed, nullsLast: reversed });
            if (price !== 0) return price;
        }

        return compareDisplayOrder(a, b);
    };
}

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

export function compareClaimStatus(a: ItemOnListDTO, b: ItemOnListDTO, userId?: string | null) {
    const userHasClaimedA = a.claims.find((c) => userId && c.claimedBy?.id === userId);
    const userHasClaimedB = b.claims.find((c) => userId && c.claimedBy?.id === userId);
    if (a.isClaimable && !userHasClaimedA && !(b.isClaimable && !userHasClaimedB)) {
        return -1;
    } else if (!(a.isClaimable && !userHasClaimedA) && b.isClaimable && !userHasClaimedB) {
        return 1;
    } else {
        return 0;
    }
}
