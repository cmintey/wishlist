<script lang="ts">
    import { getDrawerStore } from "@skeletonlabs/skeleton";
    import type { FullItem, PartialUser } from "./ItemCard/ItemCard.svelte";
    import ClaimButtons from "./ItemCard/ClaimButtons.svelte";
    import ApprovalButtons from "./ItemCard/ApprovalButtons.svelte";

    const drawerStore = getDrawerStore();
    const item: FullItem = $drawerStore.meta.item;
    const user: PartialUser | undefined = $drawerStore.meta.user;
    const showFor: boolean = $drawerStore.meta.showFor;
    const showName: boolean = $drawerStore.meta.showName;
    const onPublicList: boolean = $drawerStore.meta.onPublicList;
    const handleClaim: (v?: boolean) => void = $drawerStore.meta.handleClaim;
    const handleDelete: VoidFunction = $drawerStore.meta.handleDelete;
    const handlePurchased: (v: boolean) => void = $drawerStore.meta.handlePurchased;
    const handleApproval: (v: boolean) => void = $drawerStore.meta.handleApproval;
</script>

<div class="flex flex-col space-y-2 p-4 pb-12">
    <div class="flex w-full justify-center">
        <hr class="self-c !w-12 !rounded !border-t-4" />
    </div>
    <span class="text-xl font-bold md:text-2xl">
        {item.name}
    </span>
    <div class="flex justify-center">
        {#if item.imageUrl}
            <img class="" alt="product" src={item.imageUrl} />
        {/if}
    </div>
    <div class="flex flex-row space-x-2 text-base md:text-lg">
        {#if item.price}
            <span class="font-semibold">{item.price}</span>
            <span>·</span>
        {/if}

        <span>
            {#if showFor}
                For <span class="text-secondary-700-200-token font-bold">{item.user?.name}</span>
            {:else}
                Added by <span class="text-secondary-700-200-token font-bold">{item.addedBy?.name}</span>
            {/if}
        </span>
    </div>
    <p class="whitespace-pre-wrap">{item.note}</p>
    <div class="flex flex-row justify-between">
        <ClaimButtons
            {item}
            {onPublicList}
            {showName}
            {user}
            on:claim={() => handleClaim()}
            on:unclaim={() => handleClaim(true)}
            on:purchase={(event) => handlePurchased(event.detail.purchased)}
        />
        <ApprovalButtons
            {item}
            {user}
            on:approve={() => handleApproval(true)}
            on:deny={() => handleApproval(false)}
            on:delete={handleDelete}
            on:edit={() => getDrawerStore().close()}
        />
    </div>
</div>
