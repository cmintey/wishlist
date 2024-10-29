<script lang="ts" module>
    export type PartialUser = {
        username: string;
        name: string;
    };
    export type PublicUser = {
        username: string;
        name: string | null;
    };
    export type FullItem = Item & {
        addedBy: PartialUser | null;
        pledgedBy: PartialUser | null;
        publicPledgedBy?: PublicUser | null;
        user: PartialUser | null;
        itemPrice: ItemPrice | null;
    };
</script>

<script lang="ts">
    import {
        getDrawerStore,
        getModalStore,
        getToastStore,
        type DrawerSettings,
        type ModalSettings
    } from "@skeletonlabs/skeleton";
    import type { Item, ItemPrice } from "@prisma/client";
    import { ItemAPI } from "$lib/api/items";
    import ApprovalButtons from "./ApprovalButtons.svelte";
    import ClaimButtons from "./ClaimButtons.svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import type { ItemVoidFunction } from "./ReorderButtons.svelte";
    import ReorderButtons from "./ReorderButtons.svelte";
    import { formatPrice } from "$lib/price-formatter";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    interface Props {
        item: FullItem;
        user?: (PartialUser & { id: string }) | undefined;
        showClaimedName?: boolean;
        showFor?: boolean;
        onPublicList?: boolean;
        reorderActions?: boolean;
        onIncreasePriority?: ItemVoidFunction | undefined;
        onDecreasePriority?: ItemVoidFunction | undefined;
    }

    let {
        item,
        user = undefined,
        showClaimedName = false,
        showFor = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority = undefined,
        onDecreasePriority = undefined
    }: Props = $props();

    const modalStore = getModalStore();
    const toastStore = getToastStore();
    const drawerStore = getDrawerStore();

    let imageUrl: string | undefined = $derived.by(() => {
        if (item.imageUrl) {
            try {
                new URL(item.imageUrl);
                return item.imageUrl;
            } catch {
                return `/api/assets/${item.imageUrl}`;
            }
        }
    });
    let locale: string | undefined = $state();

    const itemAPI = new ItemAPI(item.id);

    onMount(() => {
        if (navigator.languages?.length > 0) {
            locale = navigator.languages[0];
        } else {
            locale = navigator.language;
        }
    });

    const triggerErrorToast = () => {
        toastStore.trigger({
            message: `Oops! Something went wrong.`,
            background: "variant-filled-warning",
            autohide: true,
            timeout: 5000
        });
    };

    const confirmDeleteModal: ModalSettings = {
        type: "confirm",
        title: "Please Confirm",
        body: `Are you sure you wish to delete ${item.name}?`,
        // confirm = TRUE | cancel = FALSE
        response: async (r: boolean) => {
            if (r) {
                const resp = await itemAPI.delete();

                if (resp.ok) {
                    invalidateAll();

                    toastStore.trigger({
                        message: `${item.name} was deleted`,
                        autohide: true,
                        timeout: 5000
                    });
                    drawerStore.close();
                } else {
                    triggerErrorToast();
                }
            }
        }
    };

    const approvalModal = (approve: boolean): ModalSettings => ({
        type: "confirm",
        title: "Please Confirm",
        body: `Are you sure you wish to <b>${approve ? "approve" : "deny"}</b> suggestion ${item.name} from ${
            item.addedBy?.name
        }?`,
        response: async (r: boolean) => {
            if (r) {
                const resp = await (approve ? itemAPI.approve() : itemAPI.deny());

                if (resp.ok) {
                    toastStore.trigger({
                        message: `${item.name} was ${approve ? "approved" : "denied"}`,
                        autohide: true,
                        timeout: 5000
                    });
                    drawerStore.close();
                } else {
                    triggerErrorToast();
                }
            }
        }
    });

    const handleDelete = async () => modalStore.trigger(confirmDeleteModal);
    const handleApproval = async (approve = true) => modalStore.trigger(approvalModal(approve));
    const handleEdit = () => {
        goto(`/wishlists/${item.user?.username}/edit/${item.id}?ref=${$page.url}`);
    };

    const handleClaim = async (unclaim = false) => {
        if (user?.id) {
            const resp = await (unclaim ? itemAPI.unclaim() : itemAPI.claim(user?.id));

            if (resp.ok) {
                toastStore.trigger({
                    message: `${unclaim ? "Unclaimed" : "Claimed"} item`,
                    autohide: true,
                    timeout: 5000
                });
            } else {
                triggerErrorToast();
            }
        } else {
            modalStore.trigger({
                type: "component",
                component: "createSystemUser",
                async response(data: { id?: string }) {
                    if (unclaim) {
                        return;
                    }
                    if (data.id) {
                        const resp = await itemAPI.publicClaim(data.id);

                        if (resp.ok) {
                            toastStore.trigger({
                                message: "Claimed item",
                                autohide: true,
                                timeout: 5000
                            });
                        } else {
                            triggerErrorToast();
                        }
                    }
                }
            });
        }
        drawerStore.close();
    };

    const handlePurchased = async (purchased: boolean) => {
        await (purchased ? itemAPI.purchase() : itemAPI.unpurchase());
    };

    const drawerSettings: DrawerSettings = $derived({
        id: "item",
        position: "bottom",
        height: "max-h-screen",
        padding: "md:px-12 lg:px-32 xl:px-56",
        meta: {
            item,
            showFor,
            user,
            locale,
            showClaimedName,
            onPublicList,
            handleClaim,
            handleDelete,
            handlePurchased,
            handleApproval,
            handleEdit
        }
    });
</script>

<div
    class="card card-hover block w-full text-start"
    class:variant-ghost-warning={!item.approved}
    onclick={() => drawerStore.open(drawerSettings)}
    onkeyup={(e) => (e.key === "Enter" ? drawerStore.open(drawerSettings) : null)}
    role="button"
    tabindex="0"
>
    <header class="card-header">
        <div class="flex w-full">
            <span class="line-clamp-2 text-xl font-bold md:text-2xl">
                {#if item.url}
                    <a
                        class="dark:!text-primary-200"
                        href={item.url}
                        onclick={(e) => e.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {item.name}
                    </a>
                {:else}
                    {item.name}
                {/if}
            </span>
        </div>
    </header>

    <div class="flex flex-row space-x-2 p-4">
        {#if imageUrl}
            <img class="h-36 w-36 object-contain" alt={item.name} referrerpolicy="no-referrer" src={imageUrl} />
        {/if}

        <div class="flex flex-col">
            {#if item.price || item.itemPrice}
                <span class="text-lg font-semibold">{formatPrice(item, locale)}</span>
            {/if}

            <span class="text-base md:text-lg">
                {#if showFor}
                    For <span class="text-secondary-700-200-token font-bold">{item.user?.name}</span>
                {:else if !onPublicList}
                    Added by <span class="text-secondary-700-200-token font-bold">{item.addedBy?.name}</span>
                {/if}
            </span>
            <p class="line-clamp-4 whitespace-pre-wrap">{item.note}</p>
        </div>
    </div>

    <footer
        class="card-footer flex flex-row"
        class:justify-between={!reorderActions}
        class:justify-center={reorderActions}
    >
        {#if reorderActions}
            <ReorderButtons {item} {onDecreasePriority} {onIncreasePriority} />
        {:else}
            <ClaimButtons
                {item}
                {onPublicList}
                showName={showClaimedName}
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
                on:edit={handleEdit}
            />
        {/if}
    </footer>
</div>
