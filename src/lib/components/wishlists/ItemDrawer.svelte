<script lang="ts" module>
    export interface ItemDrawerProps {
        open: boolean;
        item: ItemOnListDTO;
        itemNameShort: string;
        user: PartialUser | undefined;
        userCanManage: boolean;
        groupId: string;
        showFor: boolean;
        showClaimedName: boolean;
        showClaimForOwner: boolean;
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
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";
    import type { MessageFormatter } from "$lib/server/i18n";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import ItemImage from "./ItemCard/components/ItemImage.svelte";
    import ItemAttributes from "./ItemCard/components/ItemAttributes.svelte";
    import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
    import ModalContent from "../modals/parts/ModalContent.svelte";
    import ModalBackdrop from "../modals/parts/ModalBackdrop.svelte";

    const t = getFormatter();
    let {
        open = $bindable(false),
        item,
        itemNameShort,
        user,
        userCanManage,
        groupId,
        showFor,
        showClaimedName,
        showClaimForOwner
        onPublicList,
        handlePurchased,
        handleEdit,
        defaultImage: _defaultImage,
        requireClaimEmail,
    }: ItemDrawerProps = $props();

    const onEdit = () => {
        open = false;
        handleEdit();
    };
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
        <ItemImage class="max-h-full object-scale-down" {item}>
            {#snippet defaultImage(t)}
                {@render _defaultImage(t, "w-40 md:w-48 aspect-square rounded")}
            {/snippet}
        </ItemImage>
    </div>

                {#if item.url}
                    <a class="dark:!text-primary-200" href={item.url} rel="noreferrer" target="_blank">
                        {$t("wishes.view-item")}
                    </a>
                {/if}

    <ItemAttributes fullNotes {item} {onPublicList} {showClaimForOwner} {showClaimedName} showDetail {showFor} {user} />

                <div class="flex flex-row justify-between pb-4">
                    <ClaimButtons
                        {groupId}
                        {item}
                        {onPublicList}
                        onPurchased={handlePurchased}
                        {requireClaimEmail}
                        {showClaimForOwner}
            {showClaimedName}
                        {user}
                    />

        <ManageButtons
            {item}
            {onEdit}
            {user}
            {userCanManage}
            {itemNameShort}
        />
    </div>
</div>
