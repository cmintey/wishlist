import { writable } from "svelte/store";

export const isInstalled = writable<boolean>(false);
