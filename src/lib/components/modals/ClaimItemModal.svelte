<script lang="ts">
    import { SystemUsersAPI } from "$lib/api/users";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getModalStore, getToastStore } from "@skeletonlabs/skeleton";
    import { errorToast } from "../toasts";
    import { ListItemAPI } from "$lib/api/lists";
    import { ClaimAPI } from "$lib/api/claims";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        parent: any;
    }

    interface Meta {
        item: ItemOnListDTO;
        userId: string | undefined;
        groupId: string | undefined;
        claimId: string | undefined;
        requireClaimEmail: boolean;
        maxQuantity: number;
    }

    let { parent }: Props = $props();

    const t = getFormatter();
    const modalStore = getModalStore();
    const toastStore = getToastStore();

    const { item, userId, groupId, claimId, requireClaimEmail }: Meta = $modalStore[0].meta;

    const claim = item.claims.find((claim) => claim.claimId === claimId);

    let username: string | undefined = $state();
    let name: string | undefined = $state();
    let quantity = $state(claim?.quantity || 1);
    let error: string | undefined = $state();

    async function onUnclaim() {
        quantity = 0;
        return onFormSubmit();
    }

    async function onFormSubmit() {
        if (quantity > item.remainingQuantity + (claim?.quantity || 0)) {
            error = $t("errors.could-not-claim-quantity-items", {
                values: { quantity, availableQuantity: item.remainingQuantity }
            });
            return;
        }

        if (userId) {
            if (claim) {
                handleUpdateClaim(claim.claimId);
            } else {
                handleUserClaim(userId);
            }
        } else {
            handlePublicClaim();
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
            return modalStore.close();
        } else {
            parent.onClose();
            errorToast(toastStore, $t("general.oops"));
        }
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
            return modalStore.close();
        } else {
            parent.onClose();
            errorToast(toastStore, $t("general.oops"));
        }
    }

    async function handlePublicClaim() {
        const systemUsersAPI = new SystemUsersAPI(groupId);
        const userResp = await systemUsersAPI.create(username, name);
        if (!userResp.ok) {
            const responseData = await userResp.json();

            parent.onClose();
            errorToast(toastStore, responseData.message || $t("general.oops"));
            return;
        }
        const { id: publicUserId } = await userResp.json();

        const listItemAPI = new ListItemAPI(item.listId, item.id);
        const resp = await listItemAPI.claimPublic(publicUserId, quantity);

        if (resp.ok) {
            toastStore.trigger({
                message: $t("wishes.claimed-item", { values: { claimed: true } }),
                autohide: true,
                timeout: 5000
            });
            $modalStore[0].response?.(true);
            return modalStore.close();
        } else {
            parent.onClose();
            errorToast(toastStore, $t("general.oops"));
        }
    }
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">{$t("wishes.claim-details")}</header>
    <form onsubmit={onFormSubmit}>
        {#if !userId}
            <span>{$t("wishes.before-you-can-claim-the-item-we-just-need-one-thing-from-you")}</span>
            <label class="w-fit">
                <span>{$t("general.name-optional")}</span>
                <div class="input-group grid-cols-[auto_1fr_auto]">
                    <div class="input-group-shim">
                        <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
                    </div>
                    <input class="input" type="text" bind:value={name} />
                </div>
            </label>

            {#if requireClaimEmail}
                <label class="w-fit">
                    <span>{$t("auth.email")}</span>
                    <div class="input-group grid-cols-[auto_1fr_auto]">
                        <div class="input-group-shim">
                            <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
                        </div>
                        <input class="input" required type="email" bind:value={username} />
                    </div>
                </label>
            {/if}
        {/if}

        {#if item.remainingQuantity > 1 || claim}
            <div class="flex flex-col gap-1">
                <label class="w-fit">
                    <span>{$t("wishes.enter-the-quantity-to-claim")}</span>
                    <input
                        class={["input", error && "input-error"]}
                        inputmode="numeric"
                        max={item.remainingQuantity + (claim?.quantity || 0)}
                        min={claim ? 0 : 1}
                        required
                        step="1"
                        type="number"
                        bind:value={quantity}
                    />
                </label>
                {#if error}
                    <span class="text-error-500-400-token text-sm">{error}</span>
                {/if}
                {#if claim}
                    <span class="subtext">
                        {$t("wishes.claimed-info-text", {
                            values: { claimedQuantity: claim.quantity }
                        })}
                        {#if item.quantity}
                            {$t("wishes.additional-items-requested", {
                                values: { remainingQuantity: item.remainingQuantity }
                            })}
                        {/if}
                    </span>
                {/if}
            </div>
        {/if}

        <footer class={["flex flex-wrap gap-2", claim ? "justify-between" : "justify-end"]}>
            {#if claim}
                <button class="variant-filled-error btn btn-sm md:btn-base" onclick={onUnclaim} type="button">
                    {$t("wishes.unclaim")}
                </button>
            {/if}
            <div class="flex flex-wrap gap-2">
                <button class="btn btn-sm md:btn-base {parent.buttonNeutral}" onclick={parent.onClose} type="button">
                    {$t("general.cancel")}
                </button>
                <button class="btn btn-sm md:btn-base {parent.buttonPositive}" type="submit">
                    {$t("wishes.claim")}
                </button>
            </div>
        </footer>
    </form>
</div>
