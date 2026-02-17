<script lang="ts">
    import { SystemUsersAPI } from "$lib/api/users";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { ListItemAPI } from "$lib/api/lists";
    import { ClaimAPI } from "$lib/api/claims";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "../toaster";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";

    interface Props extends Omit<BaseModalProps, "title" | "description" | "actions" | "children" | "element"> {
        item: ItemOnListDTO;
        userId: string | undefined;
        groupId: string;
        requireClaimEmail: boolean;
        claimId?: string;
        onSuccess?: VoidFunction;
        onFailure?: VoidFunction;
    }

    let {
        item,
        userId,
        groupId,
        claimId,
        requireClaimEmail,
        onSuccess,
        onFailure,
        trigger: inputTrigger,
        ...rest
    }: Props = $props();

    const t = getFormatter();
    let open = $state(false);

    const claim = $derived(item.claims.find((claim) => claim.claimId === claimId));

    let username: string | undefined = $state();
    let name: string | undefined = $state();
    let quantity = $derived(claim?.quantity || 1);
    let error: string | undefined = $state();

    async function handleTrigger(e: MouseEvent) {
        e.stopPropagation();
        if (!userId) {
            open = true;
            return;
        }
        if (claim && item.quantity === 1 && claim.quantity === 1) {
            return onUnclaim();
        }
        if (!claim && item.remainingQuantity === 1) {
            quantity = 1;
            return onFormSubmit();
        }
        open = true;
    }

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
            let description;
            if (quantity === 0) {
                description = $t("wishes.claimed-item", { values: { claimed: false } });
            } else {
                description = $t("wishes.updated-claim");
            }
            closeAndToast(description);
        } else {
            onFailure?.();
            toaster.error({ description: $t("general.oops") });
        }
    }

    async function handleUserClaim(userId: string) {
        const listItemAPI = new ListItemAPI(item.listId, item.id);
        const resp = await listItemAPI.claim(userId, quantity);

        if (resp.ok) {
            closeAndToast($t("wishes.claimed-item", { values: { claimed: true } }));
        } else {
            onFailure?.();
            toaster.error({ description: $t("general.oops") });
        }
    }

    async function handlePublicClaim() {
        const systemUsersAPI = new SystemUsersAPI(groupId);
        const userResp = await systemUsersAPI.create(username, name);
        if (!userResp.ok) {
            const responseData = await userResp.json();

            onFailure?.();
            toaster.error({ description: responseData.message || $t("general.oops") });
            return;
        }
        const { id: publicUserId } = await userResp.json();

        const listItemAPI = new ListItemAPI(item.listId, item.id);
        const resp = await listItemAPI.claimPublic(publicUserId, quantity);

        if (resp.ok) {
            closeAndToast($t("wishes.claimed-item", { values: { claimed: true } }));
        } else {
            onFailure?.();
            toaster.error({ description: $t("general.oops") });
        }
    }

    function closeAndToast(description: string) {
        open = false;
        // wait for transition to finish before triggering toast
        setTimeout(() => toaster.info({ description }), 250);
        onSuccess?.();
    }
</script>

<BaseModal
    description={$t("wishes.before-you-can-claim-the-item-we-just-need-one-thing-from-you")}
    onOpenChange={(e) => (open = e.open)}
    {open}
    title={$t("wishes.claim-details")}
    {...rest}
>
    {#snippet trigger(props)}
        {@render inputTrigger({ ...props, onclick: handleTrigger })}
    {/snippet}

    {#if !userId}
        <span>{$t("wishes.before-you-can-claim-the-item-we-just-need-one-thing-from-you")}</span>
        <label class="w-fit">
            <span>{$t("general.name-optional")}</span>
            <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="ig-cell preset-tonal">
                    <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
                </div>
                <input class="ig-input" type="text" bind:value={name} />
            </div>
        </label>

        {#if requireClaimEmail}
            <label class="w-fit">
                <span>{$t("auth.email")}</span>
                <div class="input-group grid-cols-[auto_1fr_auto]">
                    <div class="ig-cell preset-tonal">
                        <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
                    </div>
                    <input class="ig-input" required type="email" bind:value={username} />
                </div>
            </label>
        {/if}
    {/if}

    {#if item.remainingQuantity > 1 || claim}
        <div class="flex flex-col gap-1">
            <label class="w-fit">
                <span>{$t("wishes.enter-the-quantity-to-claim")}</span>
                <input
                    class={["input", error && "input-invalid"]}
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
                <span class="text-invalid">{error}</span>
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

    {#snippet actions({ neutralStyle, negativeStyle, positiveStyle })}
        <Dialog.CloseTrigger class={neutralStyle} type="button">
            {$t("general.cancel")}
        </Dialog.CloseTrigger>

        <div class="flex flex-wrap gap-2">
            {#if claim}
                <button class={negativeStyle} onclick={onUnclaim} type="button">
                    {$t("wishes.unclaim")}
                </button>
            {/if}
            <button class={positiveStyle} onclick={onFormSubmit} type="button">
                {$t("wishes.claim")}
            </button>
        </div>
    {/snippet}
</BaseModal>
