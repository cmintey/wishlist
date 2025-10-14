import type { Writable } from "svelte/store";
export const smtpAcknowledged: Writable<boolean> = localStorageStore("smtpAcknowledged", false);
