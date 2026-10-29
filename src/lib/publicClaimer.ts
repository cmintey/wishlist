import { browser } from "$app/environment";

const STORAGE_KEY = "wishlist:public-claimer-ids";

/**
 * Public claimers have no account, so nothing ties a claim they just made to
 * the page they are looking at. Remembering the SystemUser ids this browser
 * claimed as lets the list show them their own claim for the rest of the
 * session; the emailed link is what works after that.
 *
 * sessionStorage can throw (private windows, blocked site data), so every
 * access is guarded and failure just means the claim is not highlighted.
 */
export const rememberPublicClaimer = (publicUserId: string) => {
    if (!browser) return;
    try {
        const ids = getPublicClaimerIds();
        if (!ids.includes(publicUserId)) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, publicUserId]));
        }
    } catch {
        // not being able to remember is not worth failing the claim over
    }
};

export const getPublicClaimerIds = (): string[] => {
    if (!browser) return [];
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
        return [];
    }
};

export const isOwnPublicClaim = (publicClaimedById: string | undefined) =>
    !!publicClaimedById && getPublicClaimerIds().includes(publicClaimedById);
