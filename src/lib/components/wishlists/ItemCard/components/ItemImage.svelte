<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import type { ClassValue } from "svelte/elements";
    import { getItem } from "../context";
    import Image from "$lib/components/Image.svelte";
    import { resolve } from "$app/paths";
    import type { MessageFormatter } from "$lib/server/i18n";

    interface Props {
        class?: ClassValue;
        defaultImage: (t: MessageFormatter, sizeClasses?: ClassValue) => any;
    }

    const { defaultImage, ...props }: Props = $props();
    const t = getFormatter();
    const item = getItem();

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
