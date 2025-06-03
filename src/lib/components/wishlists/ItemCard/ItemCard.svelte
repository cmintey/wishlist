<script lang="ts" module>
    export interface PartialUser extends Pick<User, "id" | "name"> {
        activeGroupId: string;
    }
</script>

<script lang="ts">
    import {
        getDrawerStore,
        getModalStore,
        getToastStore,
        type DrawerSettings,
        type ModalSettings
    } from "@skeletonlabs/skeleton";
    import type { User } from "@prisma/client";
    import { ItemAPI } from "$lib/api/items";
    import ClaimButtons from "./ClaimButtons.svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import type { ItemVoidFunction } from "./ReorderButtons.svelte";
    import ReorderButtons from "./ReorderButtons.svelte";
    import { formatPrice } from "$lib/price-formatter";
    import { page } from "$app/state";
    import ManageButtons from "./ManageButtons.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { ListItemAPI } from "$lib/api/lists";
    import { ClaimAPI } from "$lib/api/claims";
    import { DeleteConfirmationResult } from "$lib/components/modals/DeleteItemModal.svelte";
    import Image from "$lib/components/Image.svelte";
    import type { ClassValue } from "svelte/elements";
    import type { MessageFormatter } from "$lib/server/i18n";
    import { errorToast } from "$lib/components/toasts";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        item: ItemOnListDTO;
        user?: PartialUser; // logged in user
        showClaimedName?: boolean;
        showFor?: boolean;
        onPublicList?: boolean;
        reorderActions?: boolean;
        onIncreasePriority?: ItemVoidFunction | undefined;
        onDecreasePriority?: ItemVoidFunction | undefined;
    }

    const {
        item,
        user = undefined,
        showClaimedName = false,
        showFor = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority = undefined,
        onDecreasePriority = undefined
    }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();
    const toastStore = getToastStore();
    const drawerStore = getDrawerStore();

    $effect(() => {
        if (page.url.searchParams.get("item-id") === item.id.toString()) {
            openDrawer();
        }
    });

    const imageUrl: string | undefined = $derived.by(() => {
        if (item.imageUrl) {
            try {
                new URL(item.imageUrl);
                return item.imageUrl;
            } catch {
                return `/api/assets/${item.imageUrl}`;
            }
        }
    });

    const userClaim = $derived(item.claims.find((claim) => claim.claimedBy && claim.claimedBy.id === user?.id));

    const itemAPI = $derived(new ItemAPI(item.id));
    const listItemAPI = $derived(new ListItemAPI(item.listId, item.id));
    const claimAPI = $derived(new ClaimAPI(item.claims[0]?.claimId));

    const itemNameShort = item.name.length > 42 ? item.name.substring(0, 42) + "…" : item.name;
    const confirmDeleteModal: ModalSettings = {
        type: "component",
        component: "deleteItem",
        title: $t("general.please-confirm"),
        body: $t(
            item.listCount > 1
                ? "wishes.are-you-sure-you-wish-to-delete-item-multiple-lists"
                : "wishes.are-you-sure-you-wish-to-delete-item",
            { values: { name: itemNameShort } }
        ),
        meta: {
            multipleLists: item.listCount > 1
        },
        response: async (r: DeleteConfirmationResult) => {
            if (r == DeleteConfirmationResult.DELETE) {
                const resp = await itemAPI.delete();

                if (resp.ok) {
                    invalidateAll();

                    toastStore.trigger({
                        message: $t("wishes.item-was-deleted", { values: { name: itemNameShort } }),
                        autohide: true,
                        timeout: 5000
                    });
                    drawerStore.close();
                } else {
                    errorToast(toastStore);
                }
            } else if (r === DeleteConfirmationResult.REMOVE) {
                const resp = await listItemAPI.delete();

                if (resp.ok) {
                    invalidateAll();

                    toastStore.trigger({
                        message: $t("wishes.item-was-removed-from-list", { values: { name: itemNameShort } }),
                        autohide: true,
                        timeout: 5000
                    });
                    drawerStore.close();
                } else {
                    errorToast(toastStore);
                }
            }
        }
    };

    const approvalModal = (approve: boolean): ModalSettings => ({
        type: "confirm",
        title: $t("general.please-confirm"),
        body: $t("wishes.approval-confirmation", { values: { name: item.addedBy?.name, approve } }),
        response: async (r: boolean) => {
            if (r) {
                const resp = await (approve ? listItemAPI.approve() : listItemAPI.deny());

                if (resp.ok) {
                    toastStore.trigger({
                        message: $t("wishes.item-approved", { values: { name: itemNameShort, approved: approve } }),
                        autohide: true,
                        timeout: 5000
                    });
                    drawerStore.close();
                } else {
                    errorToast(toastStore);
                }
            }
        },
        buttonTextCancel: $t("general.cancel"),
        buttonTextConfirm: $t("general.confirm")
    });

    const handleDelete = async () => modalStore.trigger(confirmDeleteModal);
    const handleApproval = async (approve = true) => modalStore.trigger(approvalModal(approve));
    const handleEdit = () => {
        goto(`/items/${item.id}/edit?redirectTo=${page.url.pathname}`);
    };

    const doClaim = async (userId: string, quantity = 1, unclaim = false) => {
        // TODO update API to allow claiming multiple
        const resp = await (unclaim ? claimAPI.unclaim() : listItemAPI.claim(userId, quantity));

        if (resp.ok) {
            toastStore.trigger({
                message: $t("wishes.claimed-item", { values: { claimed: !unclaim } }),
                autohide: true,
                timeout: 5000
            });
        } else {
            errorToast(toastStore);
        }
    };

    const handleClaim = async () => {
        if (item.remainingQuantity === 1 && user?.id) {
            await doClaim(user.id);
            drawerStore.close();
            return;
        }
        modalStore.trigger({
            type: "component",
            component: "claimItemModal",
            meta: {
                item,
                userId: user?.id,
                claimId: undefined
            },
            async response(r: boolean) {
                if (r) drawerStore.close();
            }
        });
    };

    const handleUnclaim = async () => {
        if (!(user?.id && userClaim)) {
            return;
        }
        if (item.quantity === 1 && userClaim.quantity === 1) {
            await doClaim(user.id, 1, true);
            drawerStore.close();
            return;
        }
        modalStore.trigger({
            type: "component",
            component: "claimItemModal",
            meta: {
                item,
                userId: user.id,
                claimId: userClaim.claimId
            },
            async response(r: boolean) {
                if (r) drawerStore.close();
            }
        });
    };

    const handlePurchased = async (purchased: boolean) => {
        const resp = await (purchased ? claimAPI.purchase() : claimAPI.unpurchase());
        if (resp.ok) {
            toastStore.trigger({
                message: $t("wishes.purchased-toast", { values: { purchased } })
            });
            item.claims[0].purchased = purchased;
        }
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
            showClaimedName,
            onPublicList,
            handleClaim,
            handleDelete,
            handlePurchased,
            handleApproval,
            handleEdit,
            defaultImage
        }
    });

    function launchDrawer() {
        goto(`?item-id=${item.id}`, { replaceState: true, noScroll: true });
    }
    function openDrawer() {
        drawerStore.open(drawerSettings);
    }
</script>

{#snippet defaultImage(t: MessageFormatter, sizeClasses: ClassValue = ["w-24", "h-24", "md:w-40", "md:h-40"])}
    <div
        class={[
            "flex-none",
            "bg-surface-300-600-token",
            "grid",
            "place-items-center",
            "rounded",
            "aspect-square",
            sizeClasses
        ]}
        aria-label={t("a11y.default-item-image")}
    >
        <iconify-icon class="w-8 md:w-16" height="none" icon="ion:gift"></iconify-icon>
    </div>
{/snippet}

<div
    class="card block w-full text-start"
    class:card-hover={!reorderActions}
    class:variant-ghost-warning={!item.approved}
    onclick={() => {
        if (!reorderActions) launchDrawer();
    }}
    onkeyup={(e) => {
        if (!reorderActions && e.key === "Enter") launchDrawer();
    }}
    role={reorderActions ? "none" : "button"}
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

    <div class="flex flex-row space-x-4 p-4">
        <Image
            class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40"
            alt={item.name}
            referrerpolicy="no-referrer"
            src={imageUrl}
        >
            {@render defaultImage($t)}
        </Image>

        <div class="flex flex-col">
            {#if item.price || item.itemPrice}
                <div class="flex items-center space-x-2">
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
                            <span class="text-secondary-700-200-token font-bold">
                                {$t("wishes.quantity-claimed", { values: { quantity: item.claimedQuantity } })}
                            </span>
                        {/if}
                    </div>
                </div>
            {/if}

            <div class="flex items-center gap-2">
                <iconify-icon icon="ion:person"></iconify-icon>
                <span class="text-wrap text-base md:text-lg">
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
                    <p class="line-clamp-2 whitespace-pre-wrap">{item.note}</p>
                </div>
            {/if}
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
                onClaim={handleClaim}
                {onPublicList}
                onPurchase={handlePurchased}
                onUnclaim={handleUnclaim}
                showName={showClaimedName}
                {user}
            />

            <ManageButtons
                {item}
                onApprove={() => handleApproval(true)}
                onDelete={handleDelete}
                onDeny={() => handleApproval(false)}
                onEdit={handleEdit}
                {user}
            />
        {/if}
    </footer>
</div>
