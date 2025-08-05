<script lang="ts">
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { formatNumberAsPrice } from "$lib/price-formatter";

    interface Props {
        items: ItemOnListDTO[];
    }

    const { items }: Props = $props();
    const t = getFormatter();

    const itemCount = $derived(items.reduce((accum, item) => accum + (item.quantity || 1), 0));
    const totalCostByCurrency = $derived.by(() => {
        const totalCostByCurrency = items
            .filter((i) => i.itemPrice !== null)
            .reduce(
                (accum, item) => {
                    accum[item.itemPrice!.currency] = (accum[item.itemPrice!.currency] ||= 0) + item.itemPrice!.value;
                    return accum;
                },
                {} as Record<string, number>
            );
        return Object.entries(totalCostByCurrency)
            .map(([currency, total]) => ({ currency, total }))
            .toSorted((a, b) => b.total - a.total);
    });
    const highestTotal = $derived(totalCostByCurrency[0]);

    let seePrices = $state(false);
</script>

<div>
    <div class="flex flex-row items-baseline gap-1">
        <span>{$t("wishes.count-items", { values: { itemCount } })}</span>
        <span>·</span>
        <span>{formatNumberAsPrice(highestTotal.currency, highestTotal.total)}</span>
        {#if totalCostByCurrency.length > 1 && !seePrices}
            <button onclick={() => (seePrices = !seePrices)}>
                <span class="text-xs text-surface-900/70 dark:text-surface-50/50">
                    {$t("wishes.show-all-currencies")}
                </span>
            </button>
        {/if}
    </div>
    {#if seePrices}
        <div class="flex flex-col gap-1 pt-1">
            <ul class="list">
                {#each totalCostByCurrency as { currency, total }}
                    <li>
                        <span
                            class="variant-ghost-primary w-fit min-w-12 px-2 py-0.5 text-center text-sm rounded-token"
                        >
                            {currency}
                        </span>
                        <span>{formatNumberAsPrice(currency, total)}</span>
                    </li>
                {/each}
            </ul>
            <button class="w-fit" onclick={() => (seePrices = !seePrices)}>
                <span class="text-xs text-surface-900/70 dark:text-surface-50/50">
                    {$t("wishes.hide-all-currencies")}
                </span>
            </button>
        </div>
    {/if}
</div>
