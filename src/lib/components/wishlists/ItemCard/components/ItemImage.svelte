<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import type { ClassValue } from "svelte/elements";
    import Image from "$lib/components/Image.svelte";
    import { resolve } from "$app/paths";
    import type { MessageFormatter } from "$lib/server/i18n";
    import type { InternalItemCardProps } from "../ItemCard.svelte";
    import type { Snippet } from "svelte";

    interface Props extends Pick<InternalItemCardProps, "item"> {
        class?: ClassValue;
        defaultImage: Snippet<[t: MessageFormatter]>;
    }

    const { item, defaultImage, ...props }: Props = $props();
    const t = getFormatter();

    const imageUrl: string | undefined = $derived.by(() => {
        if (item.imageUrl) {
            try {
                new URL(item.imageUrl);
                return item.imageUrl;
            } catch {
                if (item.imageUrl.startsWith("/") || item.imageUrl.endsWith("/")) {
                    return;
                }
                return resolve("/api/assets/[id]", { id: item.imageUrl });
            }
        }
    });
</script>

<Image {...props} alt={item.name} data-testid="image" referrerpolicy="no-referrer" src={imageUrl}>
    {@render defaultImage($t)}
</Image>
