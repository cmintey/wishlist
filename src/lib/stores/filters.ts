import { writable } from "svelte/store";

export const CLAIM_OPTIONS = ["All", "Claimed", "Unclaimed"] as const;
export type ClaimOption = (typeof CLAIM_OPTIONS)[number];
export const claimOption = writable<ClaimOption>("All");
