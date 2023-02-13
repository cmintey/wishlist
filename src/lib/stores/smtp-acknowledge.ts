import type { Writable } from "svelte/store";
import { localStorageStore } from "@skeletonlabs/skeleton";

export const smtpAcknowledged: Writable<boolean> = localStorageStore("smtpAcknowledged", false);
