<script lang="ts">
    import { getDrawerStore } from "@skeletonlabs/skeleton";
    import type { PartialUser } from "./ItemCard/ItemCard.svelte";
    import ClaimButtons from "./ItemCard/ClaimButtons.svelte";
    import ManageButtons from "./ItemCard/ManageButtons.svelte";
    import { formatPrice } from "$lib/price-formatter";
    import { t } from "svelte-i18n";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";

    const drawerStore = getDrawerStore();
    const item: ItemOnListDTO = $drawerStore.meta.item;
    const user: PartialUser | undefined = $drawerStore.meta.user;
    const showFor: boolean = $drawerStore.meta.showFor;
    const showName: boolean = $drawerStore.meta.showName;
    const onPublicList: boolean = $drawerStore.meta.onPublicList;
    const handleClaim: (v?: boolean) => void = $drawerStore.meta.handleClaim;
    const handleDelete: VoidFunction = $drawerStore.meta.handleDelete;
    const handlePurchased: (v: boolean) => void = $drawerStore.meta.handlePurchased;
    const handleApproval: (v: boolean) => void = $drawerStore.meta.handleApproval;
    const handleEdit: () => void = $drawerStore.meta.handleEdit;

    const onEdit = () => {
        drawerStore.close();
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

<div class="flex max-h-[80dvh] flex-col space-y-2 p-4 pb-4">
    <div class="flex w-full justify-center">
        <hr class="self-c !w-12 !rounded !border-t-4" />
    </div>
    <span class="text-wrap break-words text-xl font-bold md:text-2xl">
        {item.name}
    </span>
    <div class="flex max-h-[40dvh] justify-center">
        {#if imageUrl}
            <img class="max-h-full object-scale-down" alt="product" src={imageUrl} />
        {/if}
    </div>
    <div class="flex flex-row space-x-2 text-base md:text-lg">
        {#if item.price || item.itemPrice}
            <span class="font-semibold">{formatPrice(item)}</span>
            <span>·</span>
        {/if}

        <span>
            {#if showFor}
                {@html $t("wishes.for", { values: { name: item.user?.name } })}
            {:else if !onPublicList}
                {@html $t("wishes.added-by", { values: { name: item.addedBy?.name } })}
            {/if}
        </span>
    </div>
    <p class="whitespace-pre-wrap">{item.note}</p>
    <div class="flex flex-row justify-between pb-4">
        <ClaimButtons
            {item}
            {onPublicList}
            {showName}
            {user}
            on:claim={() => handleClaim()}
            on:unclaim={() => handleClaim(true)}
            on:purchase={(event) => handlePurchased(event.detail.purchased)}
        />
        <ManageButtons
            {item}
            {user}
            on:approve={() => handleApproval(true)}
            on:deny={() => handleApproval(false)}
            on:delete={handleDelete}
            on:edit={onEdit}
        />
    </div>
</div>
