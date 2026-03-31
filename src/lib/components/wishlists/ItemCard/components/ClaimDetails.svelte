<script lang="ts">
    import type { ClaimDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { getClaimedName } from "../../util";
    import type { ItemCardProps } from "../ItemCard.svelte";

    interface Props extends Pick<ItemCardProps, "item" | "user"> {
        expand: boolean;
        showName: (claim?: ClaimDTO) => boolean;
    }

    let { expand, showName, item, user }: Props = $props();
    let t = getFormatter();

    let isForOwner = $derived(item.userId === user?.id);
</script>

<div class="card text-sm">
    {#if expand}
        <div class="max-h-32 overflow-auto px-2 pb-2">
            {#each item.claims as claim}
                <div class="flex items-center justify-between py-1">
                    <span>
                        {showName(claim) || claim.claimedBy?.id === user?.id
                            ? getClaimedName(claim)
                            : $t("wishes.anonymous")}
                    </span>
                    <div class="flex flex-row items-center gap-2">
                        <span>
                            {$t("wishes.claims", { values: { claimCount: claim.quantity } })}
                        </span>
                        {#if isForOwner}
                            <button class="btn btn-icon btn-icon-sm inset-ring-error-500 preset-tonal-error inset-ring">
                                <iconify-icon class="text-lg" icon="ion:cog-outline"></iconify-icon>
                                <span class="sr-only">Edit claim</span>
                            </button>
                            <button class="btn btn-icon btn-icon-sm preset-filled-error-500">
                                <iconify-icon class="text-lg" icon="ion:cog-outline"></iconify-icon>
                                <span class="sr-only">Edit claim</span>
                            </button>
                            <button class="btn btn-icon btn-icon-sm">
                                <iconify-icon class="text-error-600-400 text-xl" icon="ion:cog-outline"></iconify-icon>
                                <span class="sr-only">Edit claim</span>
                            </button>
                            <button class="btn btn-icon btn-icon-sm">
                                <iconify-icon
                                    class="text-error-600-400 text-xl"
                                    icon="ion:close-circle-outline"
                                ></iconify-icon>
                                <span class="sr-only">Edit claim</span>
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
