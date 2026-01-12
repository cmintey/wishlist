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
        shrinkBadge?: boolean;
        badgeClass?: ClassValue;
    }

    const { item, defaultImage, shrinkBadge = false, badgeClass, ...props }: Props = $props();
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

<div class={[props.class, "relative"]}>
    {#if item.mostWanted}
        <div
            class={[
                "glow variant-filled-primary chip absolute start-1 top-1 print:start-0 print:top-0 print:-ml-3",
                badgeClass
            ]}
        >
            <iconify-icon icon="ion:star"></iconify-icon>
            <span class={[shrinkBadge ? "hidden md:block" : "block", "print:inline"]}>{$t("wishes.most-wanted")}</span>
        </div>
    {/if}
    <Image {...props} alt={item.name} data-testid="image" referrerpolicy="no-referrer" src={imageUrl}>
        {@render defaultImage($t)}
    </Image>
</div>

<style>
    .glow {
        box-shadow: 0px 0px 8px 1px rgb(var(--color-primary-500));
    }
    @media print {
        .glow {
            box-shadow: none;
        }
    }
</style>
