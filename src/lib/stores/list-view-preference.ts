import type { Writable } from "svelte/store";
import { localStorageStore } from "@skeletonlabs/skeleton";
import { browser } from "$app/environment";

export const listViewPreference: Writable<"list" | "tile"> = localStorageStore("listViewPreference", "list");

/**
 * Get the view preference from localStorage synchronously.
 * Returns the stored preference or "list" as default if none exists.
 * If no preference exists, sets it to "list" in localStorage.
 * This should be called before rendering to prevent flicker.
 * IMPORTANT: Also syncs the store with the localStorage value to ensure consistency.
 */
export const getListViewPreference = (): "list" | "tile" => {
    if (!browser) return "list";
    
    try {
        const stored = localStorage.getItem("listViewPreference");
        let value: "list" | "tile";
        
        if (stored) {
            // localStorageStore stores values as JSON, so we need to parse it
            try {
                const parsed = JSON.parse(stored);
                if (parsed === "tile" || parsed === "list") {
                    value = parsed;
                } else {
                    value = "list";
                }
            } catch {
                // If JSON parse fails, treat as invalid
                value = "list";
            }
        } else {
            // If preference doesn't exist, default to "list"
            value = "list";
        }
        
        // IMPORTANT: Sync the store with localStorage value immediately
        // This ensures the store has the correct value before any effects run
        listViewPreference.set(value);
        
        return value;
    } catch {
        return "list";
    }
};

