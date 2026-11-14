import { resolve } from "$app/paths";

/**
 * This resolves an item's external image URL or uploaded asset ID.
 */
export function getItemImageUrl(imageUrl: string | null): string | undefined {
    if (!imageUrl) return undefined;

    try {
        new URL(imageUrl);
        return imageUrl;
    } catch {
        if (imageUrl.startsWith("/") || imageUrl.endsWith("/")) return undefined;
        return resolve("/api/assets/[id]", { id: imageUrl });
    }
}
