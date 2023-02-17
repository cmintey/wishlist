import { writable } from "svelte/store";

export type ViewOption = "All" | "Gifted" | "Ungifted";
export const viewOption = writable<ViewOption>("All");
