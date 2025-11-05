import type { ClaimDTO } from "$lib/dtos/item-dto";
import { getFormatter } from "$lib/i18n";
import { get } from "svelte/store";
import type { PartialUser } from "./ItemCard/ItemCard.svelte";

export const getClaimedName = ({ claimedBy, publicClaimedBy }: ClaimDTO) => {
    if (claimedBy) {
        return claimedBy.name;
    }
    if (publicClaimedBy?.name && publicClaimedBy.name !== "ANONYMOUS_NAME") {
        return publicClaimedBy.name;
    }
    const t = getFormatter();
    return get(t)("wishes.anonymous");
};

export const shouldShowName = (
    showNameConfig: boolean,
    onPublicList: boolean,
    user: PartialUser | undefined,
    claim?: ClaimDTO
) => {
    if (showNameConfig) {
        if (onPublicList && claim?.publicClaimedBy?.name) {
            return true;
        }
        if (user && claim?.claimedBy?.groups.includes(user.activeGroupId) && claim.claimedBy?.name) {
            return true;
        }
    }
    return false;
};
