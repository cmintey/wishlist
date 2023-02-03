import { writable } from "svelte/store";

export type ViewOption = "All" | "Pledged" | "Unpledged";
export const viewOption = writable<ViewOption>("All");
