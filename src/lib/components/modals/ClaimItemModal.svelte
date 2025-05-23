<script lang="ts">
    import { SystemUsersAPI } from "$lib/api/users";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getModalStore, getToastStore } from "@skeletonlabs/skeleton";
    import { t } from "svelte-i18n";
    import { errorToast } from "../toasts";
    import { ListItemAPI } from "$lib/api/lists";
    import { ClaimAPI } from "$lib/api/claims";

    interface Props {
        parent: any;
    }

    interface Meta {
        item: ItemOnListDTO;
        userId: string | undefined;
        claimId: string | undefined;
        maxQuantity: number;
    }

    let { parent }: Props = $props();

    const modalStore = getModalStore();
    const toastStore = getToastStore();

    const { item, userId, claimId }: Meta = $modalStore[0].meta;

    const claim = item.claims.find((claim) => claim.claimId === claimId);

    let username: string | undefined = $state();
    let name: string | undefined = $state();
    let quantity = $state(claim?.quantity || 1);

    async function onUnclaim() {
        quantity = 0;
        return onFormSubmit();
    }

    async function onFormSubmit() {
        if (quantity > item.remainingQuantity + (claim?.quantity || 0)) {
            errorToast(
                toastStore,
                $t("errors.could-not-claim-quantity-items", {
                    values: { quantity, availableQuantity: item.remainingQuantity }
                })
            );
            $modalStore[0].response?.(false);
            return modalStore.close();
        }

        if (userId) {
            if (claim) {
                handleUpdateClaim(claim.claimId);
            } else {
                handleUserClaim(userId);
            }
        } else if (username) {
            handlePublicClaim(username);
        }
    }

    async function handleUpdateClaim(claimId: string) {
        const claimAPI = new ClaimAPI(claimId);
        const resp = await claimAPI.updateQuantity(quantity);
        if (resp.ok) {
            let message;
            if (quantity === 0) {
                message = $t("wishes.claimed-item", { values: { claimed: false } });
            } else {
                message = $t("wishes.updated-claim");
            }
            toastStore.trigger({
                message,
                autohide: true,
                timeout: 5000
            });
            $modalStore[0].response?.(true);
        } else {
            errorToast(toastStore);
        }
        return modalStore.close();
    }

    async function handleUserClaim(userId: string) {
        const listItemAPI = new ListItemAPI(item.listId, item.id);
        const resp = await listItemAPI.claim(userId, quantity);

        if (resp.ok) {
            toastStore.trigger({
                message: $t("wishes.claimed-item", { values: { claimed: true } }),
                autohide: true,
                timeout: 5000
            });
            $modalStore[0].response?.(true);
        } else {
            errorToast(toastStore);
            $modalStore[0].response?.(false);
        }

        return modalStore.close();
    }

    async function handlePublicClaim(username: string) {
        const systemUsersAPI = new SystemUsersAPI();
        const userResp = await systemUsersAPI.create(username, name === "" ? $t("wishes.anonymous") : name);
        if (!userResp.ok) {
            errorToast(toastStore);
            $modalStore[0].response?.(false);
            return modalStore.close();
        }
        const { publicUserId } = await userResp.json();

        const listItemAPI = new ListItemAPI(item.listId, item.id);
        const resp = await listItemAPI.claimPublic(publicUserId, quantity);

        if (resp.ok) {
            toastStore.trigger({
                message: $t("wishes.claimed-item", { values: { claimed: true } }),
                autohide: true,
                timeout: 5000
            });
            $modalStore[0].response?.(true);
        } else {
            $modalStore[0].response?.(false);
            errorToast(toastStore);
        }

        return modalStore.close();
    }
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">{$t("wishes.claim-details")}</header>
    {#if !userId}
        <span>{$t("wishes.before-you-can-claim-the-item-we-just-need-one-thing-from-you")}</span>
        <label class="w-fit">
            <span>{$t("auth.email")}</span>
            <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="input-group-shim">
                    <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
                </div>
                <input class="input" type="text" bind:value={username} />
            </div>
        </label>

        <label class="w-fit">
            <span>{$t("general.name-optional")}</span>
            <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="input-group-shim">
                    <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
                </div>
                <input class="input" type="text" bind:value={name} />
            </div>
        </label>
    {/if}

    {#if item.remainingQuantity > 1 || claim}
        <label class="w-fit">
            <span>{$t("wishes.enter-the-quantity-to-claim")}</span>
            <input
                class="input"
                max={item.remainingQuantity + (claim?.quantity || 0)}
                min={claim ? 0 : 1}
                required
                step="1"
                type="number"
                bind:value={quantity}
            />
        </label>
    {/if}

    <footer class="flex justify-between gap-2">
        <button class="variant-filled-error btn" onclick={onUnclaim}>{$t("wishes.unclaim")}</button>
        <div class="flex gap-2">
            <button class="btn {parent.buttonNeutral}" onclick={parent.onClose}>{$t("general.cancel")}</button>
            <button class="btn {parent.buttonPositive}" onclick={onFormSubmit}>{$t("wishes.claim")}</button>
        </div>
    </footer>
</div>
