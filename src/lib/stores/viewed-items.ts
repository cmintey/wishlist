import type { Item } from "@prisma/client";
import { localStorageStore } from "@skeletonlabs/skeleton";
import type { Writable } from "svelte/store";

export const viewedItems: Writable<Record<string, string>> = localStorageStore("viewedItems", {});

export const hashItems = async (items: Partial<Item>[]): Promise<string> => {
	const itemIds = items
		.map(({ id }) => id)
		.toSorted()
		.join("");
	return await hash(itemIds);
};

export const hash = async (data: string): Promise<string> => {
	const encoder = new TextEncoder();
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(data));
	return btoa(String.fromCharCode(...new Uint8Array(digest)));
};
