<script lang="ts">
    import { getDrawerStore } from "@skeletonlabs/skeleton";
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

    const t = getFormatter();
    const drawerStore = getDrawerStore();
    const item: ItemOnListDTO = $drawerStore.meta.item;
    const user: PartialUser | undefined = $drawerStore.meta.user;
    const userCanManage: boolean = $drawerStore.meta.userCanManage;
    const showFor: boolean = $drawerStore.meta.showFor;
    const showClaimedName: boolean = $drawerStore.meta.showClaimedName;
    const showAlwaysClaimedName: boolean = $drawerStore.meta.showAlwaysClaimedName;
    const showClaimForOwner: boolean = $drawerStore.meta.showClaimForOwner;
    const onPublicList: boolean = $drawerStore.meta.onPublicList;
    const handleClaim: (v?: boolean) => void = $drawerStore.meta.handleClaim;
    const handleDelete: VoidFunction = $drawerStore.meta.handleDelete;
    const handlePurchased: (v: boolean) => void = $drawerStore.meta.handlePurchased;
    const handleApproval: (v: boolean) => void = $drawerStore.meta.handleApproval;
    const handleEdit: () => void = $drawerStore.meta.handleEdit;
    const _defaultImage: Snippet<[MessageFormatter, classes?: ClassValue]> = $drawerStore.meta.defaultImage;

    const onEdit = () => {
        goto(page.url.pathname, { replaceState: true, noScroll: true });
        drawerStore.close();
        handleEdit();
    };
</script>

<div class="flex max-h-[80dvh] flex-col gap-2 p-4 pb-4">
    <div class="grid grid-cols-[1fr_auto] justify-between gap-2 pb-2">
        <span class="text-wrap break-words text-xl font-bold md:text-2xl">
            {item.name}
        </span>
        <button
            class="variant-ghost-surface btn btn-icon"
            aria-label={$t("a11y.close")}
            onclick={() => {
                goto(page.url.pathname, { replaceState: true, noScroll: true });
                drawerStore.close();
            }}
        >
            <iconify-icon icon="ion:close"></iconify-icon>
        </button>
    </div>

    <div class="flex max-h-[40dvh] justify-center">
        <ItemImage class="max-h-full object-scale-down" {item}>
            {#snippet defaultImage(t)}
                {@render _defaultImage(t, "w-40 md:w-48 aspect-square rounded")}
            {/snippet}
        </ItemImage>
    </div>

    {#if item.url}
        <a class="dark:!text-primary-200" href={item.url} rel="noreferrer" target="_blank">{$t("wishes.view-item")}</a>
    {/if}

    <ItemAttributes fullNotes {item} {onPublicList} {showClaimForOwner} {showAlwaysClaimedName} {showClaimedName} showDetail {showFor} {user} />

    <div class="flex flex-row justify-between pb-4">
        <ClaimButtons
            {item}
            onClaim={handleClaim}
            {onPublicList}
            onPurchased={handlePurchased}
            onUnclaim={() => handleClaim(true)}
            {showClaimForOwner}
            {showAlwaysClaimedName}
            {showClaimedName}
            {user}
        />

        <ManageButtons
            {item}
            onApprove={() => handleApproval(true)}
            onDelete={handleDelete}
            onDeny={() => handleApproval(false)}
            {onEdit}
            {user}
            {userCanManage}
        />
    </div>
</div>
