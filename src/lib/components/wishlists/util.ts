import type { ClaimDTO, ItemOnListDTO } from "$lib/dtos/item-dto";
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
    item: ItemOnListDTO,
    showNameConfig: boolean,
    showNameAcrossGroups: boolean,
    showForOwner: boolean,
    showPublicClaimName: boolean,
    user: PartialUser | undefined,
    claim?: ClaimDTO
) => {
    // Completely disabled
    if (!showNameConfig) {
        return false;
    }
    // Public claims: allow global visibility when enabled; otherwise fall back to
    // authenticated visibility rules so owners/managers can still see names.
    if (claim?.publicClaimedBy) {
        if (showPublicClaimName) return true;
        if (!user) return false;
        if (item.user.id === user.id && showForOwner) return true;
        if (showNameAcrossGroups) return true;
        return true;
    }

    // No logged in user
    if (!user) {
        return false;
    }
    // List owner can only view if the config is set
    if (item.user.id === user.id && showForOwner) {
        return true;
    }
    // Everyone can see who has claimed, regardless of the group.
    if (showNameAcrossGroups) return true;

    // Everyone else can only see claims by users in their group
    if (claim && (claim.publicClaimedBy || !claim.claimedBy?.groups.includes(user.activeGroupId))) {
        return false;
    }
    return true;
};
