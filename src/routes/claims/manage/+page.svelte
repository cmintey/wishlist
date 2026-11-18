<script lang="ts">
    import { page } from "$app/state";
    import ClaimButtons from "$lib/components/wishlists/ItemCard/ClaimButtons.svelte";
    import ItemAttributes from "$lib/components/wishlists/ItemCard/components/ItemAttributes.svelte";
    import ItemImage from "$lib/components/wishlists/ItemCard/components/ItemImage.svelte";
    import { getFormatter } from "$lib/i18n";
    import { rememberPublicClaim } from "$lib/publicClaimer";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    const t = getFormatter();
    let released = $state(false);

    $effect(() => {
        const token = page.url.searchParams.get("token");
        if (token) rememberPublicClaim(data.claimId, token);
    });

    const itemProps = $derived({
        item: data.item,
        groupId: data.groupId,
        user: undefined,
        showClaimedName: false,
        showNameAcrossGroups: false,
        showClaimForOwner: false,
        showPublicClaimName: false,
        requireClaimEmail: data.requireClaimEmail,
        onPublicList: true,
        isSelfClaimable: false
    });
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("wishes.manage-claim")}</h1>

    <div class="bg-surface-100-900 rounded-container border-surface-200-800 flex w-80 flex-col space-y-4 border p-4">
        <ItemImage class="rounded-container max-h-40 w-full object-contain" item={data.item}>
            {#snippet defaultImage(t)}
                <div
                    class="bg-surface-300-700 grid h-40 place-items-center"
                    aria-label={t("a11y.default-item-image")}
                    role="img"
                >
                    <iconify-icon class="size-16" height="none" icon="ion:gift"></iconify-icon>
                </div>
            {/snippet}
        </ItemImage>

        <span class="text-lg font-bold">{data.item.name}</span>

        {#if data.listPublic}
            <a class="anchor w-fit" href="/lists/{data.item.list.id}">
                {$t("email.claim-view-list", { values: { listName: data.listName } })}
            </a>
        {/if}

        {#if released}
            <span>{$t("wishes.claim-released", { values: { itemName: data.item.name } })}</span>
        {:else}
            <span class="subtext">
                {$t("wishes.manage-claim-description", {
                    values: { quantity: data.quantity, listName: data.listName }
                })}
            </span>
            <ItemAttributes {...itemProps} fullNotes />
            <ClaimButtons {...itemProps} isClaimableOrClaimed={() => {}} onPublicUnclaim={() => (released = true)} />
        {/if}
    </div>
</div>

<svelte:head>
    <title>{$t("wishes.manage-claim")}</title>
</svelte:head>
