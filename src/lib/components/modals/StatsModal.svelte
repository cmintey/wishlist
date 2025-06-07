<script lang="ts">
    import { melt } from "@melt-ui/svelte";
    import type { ComponentProps } from "svelte";
    import BaseModal from "./BaseModal.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { formatNumberAsPrice } from "$lib/price-formatter";

    type BaseProps = ComponentProps<typeof BaseModal>;
    interface Props {
        trigger: BaseProps["trigger"];
        items: ItemOnListDTO[];
    }

    const { trigger, items }: Props = $props();

    const totalCostByCurrency = $derived(
        items
            .filter((i) => i.itemPrice !== null)
            .reduce(
                (accum, item) => {
                    accum[item.itemPrice!.currency] = (accum[item.itemPrice!.currency] ||= 0) + item.itemPrice!.value;
                    return accum;
                },
                {} as Record<string, number>
            )
    );
</script>

<BaseModal title="Stats" {trigger}>
    {#snippet description()}
        Information about your list
    {/snippet}

    {#snippet body()}
        <div class="flex flex-col gap-2">
            <span>{items.reduce((accum, { quantity }) => accum + quantity, 0)} items</span>
            <span>Total cost of list</span>
            <ul class="list">
                {#each Object.entries(totalCostByCurrency) as [currency, total]}
                    <li>
                        <span class="variant-ghost-primary w-12 px-2 py-1 text-center text-sm rounded-token">
                            {currency}
                        </span>
                        <span>{formatNumberAsPrice(currency, total)}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/snippet}

    {#snippet actions(close)}
        <!-- <div class="flex flex-row justify-end gap-2">
            <button class="variant-ghost-surface btn" use:melt={close}>Cancel</button>
            <button class="variant-filled-primary btn" use:melt={close}>Confirm</button>
        </div> -->
        <div class="flex flex-row justify-end gap-2">
            <button class="variant-filled-primary btn" use:melt={close}>Close</button>
        </div>
    {/snippet}
</BaseModal>
