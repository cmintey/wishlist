import { browser } from "$app/environment";
import { get, writable } from "svelte/store";

const STORAGE_KEY = "wishlist:public-claim-tokens";

/**
 * Public claimers have no account, so nothing ties a claim they just made to
 * the page they are looking at. Remembering each claim's token, keyed by claim
 * id, lets the list show them their own claim and release it for the rest of
 * the session; the emailed link is what works after that.
 *
 * sessionStorage can throw (private windows, blocked site data), so every
 * access is guarded and failure just means the claim is not highlighted.
 */
const readStoredTokens = (): Record<string, string> => {
    if (!browser) return {};
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return {};
        const parsed = JSON.parse(stored);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
        return Object.fromEntries(Object.entries(parsed).filter(([, token]) => typeof token === "string")) as Record<
            string,
            string
        >;
    } catch {
        return {};
    }
};

// A store rather than plain reads, so the list updates as soon as a claim is
// remembered: the live item update usually arrives before the claim response
export const publicClaimTokens = writable<Record<string, string>>(readStoredTokens());

export const rememberPublicClaim = (claimId: string, token: string) => {
    if (!browser) return;
    publicClaimTokens.update((tokens) => ({ ...tokens, [claimId]: token }));
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(get(publicClaimTokens)));
    } catch {
        // not being able to remember is not worth failing the claim over
    }
};
