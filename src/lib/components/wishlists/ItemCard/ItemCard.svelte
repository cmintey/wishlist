<script lang="ts" module>
    export interface PartialUser extends Pick<User, "id" | "name"> {
        activeGroupId: string;
    }

    export interface ItemCardProps {
        item: ItemOnListDTO;
        user?: PartialUser; // logged in user
        userCanManage?: boolean;
        showClaimedName?: boolean;
        showClaimForOwner?: boolean;
        requireClaimEmail?: boolean;
        groupId?: string;
        showFor?: boolean;
        onPublicList?: boolean;
        reorderActions?: boolean;
        onIncreasePriority?: ItemVoidFunction | undefined;
        onDecreasePriority?: ItemVoidFunction | undefined;
        onPriorityChange?: (item: ItemOnListDTO, idx: string) => void;
        isTileView?: boolean;
    }

    type ItemVoidFunction = (itemId: number) => void;
    export interface InternalItemCardProps {
        id: string;
        item: ItemOnListDTO;
        user?: PartialUser;
        userCanManage?: boolean;
        showClaimedName?: boolean;
        showClaimForOwner?: boolean;
        showFor?: boolean;
        onPublicList?: boolean;
        reorderActions?: boolean;
        onIncreasePriority?: ItemVoidFunction;
        onDecreasePriority?: ItemVoidFunction;
        onPriorityChange?: (item: ItemOnListDTO, idx: string) => void;
        onClaim?: () => void;
        onUnclaim?: () => void;
        onPurchased?: (purchased: boolean) => void;
        onDelete?: () => void;
        onEdit?: () => void;
        onApproval?: (approve: boolean) => void;
        defaultImage: Snippet<[MessageFormatter, classes?: ClassValue]>;
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
    import type { User } from "$lib/generated/prisma/client";
    import { ItemAPI } from "$lib/api/items";
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { ClaimAPI } from "$lib/api/claims";
    import { DeleteConfirmationResult } from "$lib/components/modals/DeleteItemModal.svelte";
    import type { ClassValue } from "svelte/elements";
    import type { MessageFormatter } from "$lib/server/i18n";
    import { getFormatter } from "$lib/i18n";
    import { resolve } from "$app/paths";
    import GridItemCard from "./GridItemCard.svelte";
    import ListItemCard from "./ListItemCard.svelte";
    import type { Snippet } from "svelte";

    const {
        item,
        groupId,
        user = undefined,
        userCanManage = false,
        showClaimedName = false,
        showClaimForOwner = false,
        requireClaimEmail = true,
        showFor = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority = undefined,
        onDecreasePriority = undefined,
        onPriorityChange,
        isTileView = false
    }: ItemCardProps = $props();
    const id = $props.id();
    const t = getFormatter();

    let drawerOpen = $state(false);

    $effect(() => {
        if (page.url.searchParams.get("item-id") === item.id.toString()) {
            openDrawer();
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
            multipleLists: item.listCount > 1,
            isOnlyManager: user?.id !== item.user?.id && user?.id !== item.addedBy?.id && userCanManage
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
                    errorToast(toastStore, $t("general.oops"));
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
                    errorToast(toastStore, $t("general.oops"));
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
                    errorToast(toastStore, $t("general.oops"));
                }
            }
        },
        buttonTextCancel: $t("general.cancel"),
        buttonTextConfirm: $t("general.confirm")
    });

    const handleDelete = async () => modalStore.trigger(confirmDeleteModal);
    const handleApproval = async (approve = true) => modalStore.trigger(approvalModal(approve));
    const handleEdit = () => {
        goto(resolve("/items/[itemId]/edit", { itemId: item.id.toString() }) + `?redirectTo=${page.url.pathname}`, {
            replaceState: true
        });
    };

    const doClaim = async (userId: string, quantity = 1, unclaim = false) => {
        const resp = await (unclaim ? claimAPI.unclaim() : listItemAPI.claim(userId, quantity));

        if (resp.ok) {
            toastStore.trigger({
                message: $t("wishes.claimed-item", { values: { claimed: !unclaim } }),
                autohide: true,
                timeout: 5000
            });
        } else {
            errorToast(toastStore, $t("general.oops"));
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
                groupId: groupId,
                claimId: undefined,
                requireClaimEmail: requireClaimEmail
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
            toaster.info({ description: $t("wishes.purchased-toast", { values: { purchased } }) });
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
            userCanManage,
            showClaimedName,
            showClaimForOwner,
            requireClaimEmail,
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
        drawerOpen = true;
    }

    const ItemCard = $derived(isTileView ? GridItemCard : ListItemCard);
</script>

{#snippet defaultImage(t: MessageFormatter, sizeClasses: ClassValue = ["w-24", "h-24", "md:w-40", "md:h-40"])}
    <div
        class={["bg-surface-300-600-token grid flex-none place-items-center", sizeClasses]}
        aria-label={t("a11y.default-item-image")}
        data-testid="image"
        role="img"
    >
        <iconify-icon class="size-8 md:size-16" height="none" icon="ion:gift"></iconify-icon>
    </div>
{/snippet}

<ItemDrawer
    {defaultImage}
    {groupId}
    {handleEdit}
    {handlePurchased}
    {item}
    {itemNameShort}
    {onPublicList}
    {requireClaimEmail}
    {showFor}
    showName={showClaimedName}
    {user}
    bind:open={drawerOpen}
/>

<div
    class="card block h-full w-full text-start"
    class:card-hover={!reorderActions}
    class:variant-ghost-warning={!item.approved}
    aria-labelledby={`${id}-name`}
    onclick={() => {
        if (!reorderActions) launchDrawer();
    }}
    onkeyup={(e) => {
        if (!reorderActions && e.key === "Enter") launchDrawer();
    }}
    role={reorderActions ? "none" : "button"}
>
    <ItemCard
        {id}
        {defaultImage}
        {item}
        onApproval={handleApproval}
        onClaim={handleClaim}
        {onDecreasePriority}
        onDelete={handleDelete}
        onEdit={handleEdit}
        {onIncreasePriority}
        {onPriorityChange}
        {onPublicList}
        onPurchased={handlePurchased}
        onUnclaim={handleUnclaim}
        {reorderActions}
        {showClaimForOwner}
        {showClaimedName}
        {showFor}
        {user}
        {userCanManage}
    />
</div>
