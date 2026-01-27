<script lang="ts">
    import ClaimButtons from "./ItemCard/ClaimButtons.svelte";
    import ManageButtons from "./ItemCard/ManageButtons.svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import ItemImage from "./ItemCard/components/ItemImage.svelte";
    import ItemAttributes from "./ItemCard/components/ItemAttributes.svelte";
    import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
    import ModalContent from "../modals/parts/ModalContent.svelte";
    import ModalBackdrop from "../modals/parts/ModalBackdrop.svelte";
    import type { InternalItemCardProps } from "./ItemCard/ItemCard.svelte";

    type ItemDrawerProps = {
        open: boolean;
    };
    const t = getFormatter();
    let {
        open = $bindable(false),
        defaultImage: _defaultImage,
        item,
        ...props
    }: InternalItemCardProps & ItemDrawerProps = $props();
</script>

<Dialog onOpenChange={(e) => (open = e.open)} {open}>
    <Portal>
        <ModalBackdrop></ModalBackdrop>
        <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
            <ModalContent>
                <div class="grid grid-cols-[1fr_auto] justify-between gap-2 pb-2">
                    <Dialog.Title class="text-xl font-bold text-wrap wrap-break-word md:text-2xl">
                        {item.name}
                    </Dialog.Title>
                    <Dialog.CloseTrigger
                        class="preset-tonal-surface border-surface-500 btn btn-icon border"
                        aria-label={$t("a11y.close")}
                        onclick={() => goto(page.url.pathname, { replaceState: true, noScroll: true })}
                    >
                        <iconify-icon icon="ion:close"></iconify-icon>
                    </Dialog.CloseTrigger>
                </div>

                <div class="flex max-h-[40dvh] justify-center">
                    <ItemImage class="max-h-full object-scale-down" {item}>
                        {#snippet defaultImage(t)}
                            {@render _defaultImage(t, "w-40 md:w-48 aspect-square rounded")}
                        {/snippet}
                    </ItemImage>
                </div>

                {#if item.url}
                    <a class="anchor dark:text-primary-200!" href={item.url} rel="noreferrer" target="_blank">
                        {$t("wishes.view-item")}
                    </a>
                {/if}

                <ItemAttributes {...props} fullNotes {item} showDetail />

                <div class="flex flex-row justify-between pb-4">
                    <ClaimButtons {item} {...props} />
                    <ManageButtons {item} {...props} onEdit={() => (open = false)} />
                </div>
            </ModalContent>
        </Dialog.Positioner>
    </Portal>
</Dialog>
