<script context="module" lang="ts">
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
    import type { Item } from "@prisma/client";
    import { ItemAPI } from "$lib/api/items";
    import ApprovalButtons from "./ApprovalButtons.svelte";
    import ClaimButtons from "./ClaimButtons.svelte";
    import { invalidateAll } from "$app/navigation";
    import type { ItemVoidFunction } from "./ReorderButtons.svelte";
    import ReorderButtons from "./ReorderButtons.svelte";

    export let item: FullItem;
    export let user: (PartialUser & { id: string }) | undefined = undefined;
    export let showClaimedName = false;
    export let showFor = false;
    export let onPublicList = false;
    export let reorderActions = false;
    export let onIncreasePriority: ItemVoidFunction | undefined = undefined;
    export let onDecreasePriority: ItemVoidFunction | undefined = undefined;

    const modalStore = getModalStore();
    const toastStore = getToastStore();
    const drawerStore = getDrawerStore();

    let imageUrl: string;
    const itemAPI = new ItemAPI(item.id);

    $: if (item.imageUrl) {
        try {
            new URL(item.imageUrl);
            imageUrl = item.imageUrl;
        } catch {
            imageUrl = `/api/assets/${item.imageUrl}`;
        }
    }

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

    const drawerSettings: DrawerSettings = {
        id: "item",
        position: "bottom",
        height: "max-h-screen",
        padding: "md:px-12 lg:px-32 xl:px-56",
        meta: {
            item,
            showFor,
            user,
            showClaimedName,
            onPublicList,
            handleClaim,
            handleDelete,
            handlePurchased,
            handleApproval
        }
    };
</script>

<button
    class="card card-hover block w-full text-start"
    class:variant-ghost-warning={!item.approved}
    type="button"
    on:click={() => drawerStore.open(drawerSettings)}
>
    <header class="card-header">
        <div class="flex w-full">
            <span class="line-clamp-2 text-xl font-bold md:text-2xl">
                {#if item.url}
                    <a
                        class="dark:!text-primary-200"
                        href={item.url}
                        rel="noreferrer"
                        target="_blank"
                        on:click|stopPropagation
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
            <img class="h-36 w-36 object-contain" alt="product" src={imageUrl} />
        {/if}

        <div class="flex flex-col">
            {#if item.price}
                <span class="text-lg font-semibold">{item.price}</span>
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
            />
        {/if}
    </footer>
</button>
