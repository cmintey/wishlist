<script lang="ts" module>
    export interface ItemDrawerProps {
        open: boolean;
        item: ItemOnListDTO;
        itemNameShort: string;
        user: PartialUser | undefined;
        groupId: string;
        showFor: boolean;
        showName: boolean;
        onPublicList: boolean;
        handlePurchased: (v: boolean) => void;
        handleEdit: VoidFunction;
        defaultImage: Snippet<[MessageFormatter, ClassValue]>;
        requireClaimEmail: boolean;
    }
</script>

<script lang="ts">
    import type { PartialUser } from "./ItemCard/ItemCard.svelte";
    import ClaimButtons from "./ItemCard/ClaimButtons.svelte";
    import ManageButtons from "./ItemCard/ManageButtons.svelte";
    import { formatPrice } from "$lib/price-formatter";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import type { Snippet } from "svelte";
    import Image from "../Image.svelte";
    import type { ClassValue } from "svelte/elements";
    import type { MessageFormatter } from "$lib/server/i18n";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import Markdown from "../Markdown.svelte";
    import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
    import ModalContent from "../modals/parts/ModalContent.svelte";
    import ModalBackdrop from "../modals/parts/ModalBackdrop.svelte";

    const t = getFormatter();
    let {
        open = $bindable(false),
        item,
        itemNameShort,
        user,
        groupId,
        showFor,
        showName,
        onPublicList,
        handlePurchased,
        handleEdit,
        defaultImage,
        requireClaimEmail
    }: ItemDrawerProps = $props();

    const onEdit = () => {
        open = false;
        handleEdit();
    };

    let imageUrl: string | undefined = $state();
    if (item.imageUrl) {
        try {
            new URL(item.imageUrl);
            imageUrl = item.imageUrl;
        } catch {
            imageUrl = `/api/assets/${item.imageUrl}`;
        }
    }
</script>

<Dialog onOpenChange={(e) => (open = e.open)} {open}>
    <Portal>
        <ModalBackdrop></ModalBackdrop>
        <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
            <ModalContent>
                <div class="grid grid-cols-[1fr_auto] justify-between gap-2 pb-2">
                    <Dialog.Title class="text-xl font-bold text-wrap break-words md:text-2xl">
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
                    <Image
                        class="max-h-full object-scale-down"
                        alt={item.name}
                        referrerpolicy="no-referrer"
                        src={imageUrl}
                    >
                        {@render defaultImage($t, "w-1/3 aspect-square")}
                    </Image>
                </div>

                {#if item.url}
                    <a class="dark:!text-primary-200" href={item.url} rel="noreferrer" target="_blank">
                        {$t("wishes.view-item")}
                    </a>
                {/if}

                {#if item.price || item.itemPrice}
                    <div class="flex items-center gap-x-2">
                        <iconify-icon icon="ion:pricetag"></iconify-icon>
                        <span class="text-lg font-semibold">{formatPrice(item)}</span>
                    </div>
                {/if}

                {#if item.quantity}
                    <div class="grid grid-cols-[auto_1fr] items-center gap-2 text-base md:text-lg">
                        <iconify-icon icon="ion:gift"></iconify-icon>
                        <div class="flex flex-row flex-wrap gap-x-2">
                            <span>{$t("wishes.quantity-desired", { values: { quantity: item.quantity } })}</span>
                            {#if user?.id !== item.userId}
                                <span>·</span>
                                <span class="text-secondary-800-200 font-bold">
                                    {$t("wishes.quantity-claimed", { values: { quantity: item.claimedQuantity } })}
                                </span>
                            {/if}
                        </div>
                    </div>
                {/if}

                <div class="flex items-center gap-x-2">
                    <iconify-icon icon="ion:person"></iconify-icon>
                    <span class="text-base md:text-lg">
                        {#if showFor}
                            {@html $t("wishes.for", { values: { name: item.user.name } })}
                        {:else if !onPublicList}
                            {@html $t("wishes.added-by", { values: { name: item.addedBy.name } })}
                        {:else}
                            {@html item.addedBy.id === item.user.id
                                ? $t("wishes.added-by", { values: { name: item.addedBy.name } })
                                : $t("wishes.added-by-somebody-else")}
                        {/if}
                    </span>
                </div>

                {#if item.note}
                    <div class="grid flex-none grid-cols-[auto_1fr] items-center gap-2">
                        <iconify-icon icon="ion:reader"></iconify-icon>
                        <p class="whitespace-pre-wrap">
                            <Markdown source={item.note} />
                        </p>
                    </div>
                {/if}

                <div class="flex flex-row justify-between pb-4">
                    <ClaimButtons
                        {groupId}
                        {item}
                        {onPublicList}
                        onPurchase={handlePurchased}
                        {requireClaimEmail}
                        {showName}
                        {user}
                    />

                    <ManageButtons {item} {itemNameShort} {onEdit} {user} />
                </div>
            </ModalContent>
        </Dialog.Positioner>
    </Portal>
</Dialog>
