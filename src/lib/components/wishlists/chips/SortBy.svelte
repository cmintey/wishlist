<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import BaseChip from "./BaseChip.svelte";

    const t = getFormatter();
    const options: Option[] = [
        {
            value: "default",
            displayValue: $t("wishes.default-sort")
        },
        {
            value: "price",
            direction: "asc",
            displayValue: $t("wishes.price-low-to-high")
        },
        {
            value: "price",
            direction: "desc",
            displayValue: $t("wishes.price-high-to-low")
        }
    ];

    const label = $t("wishes.sort-by");
    const defaultOption = options[0];
    const searchParam = "sort";
    const directionParam = "dir";
    const prefix = "ion:swap-vertical";
</script>

<BaseChip {defaultOption} {directionParam} {label} {options} {prefix} {searchParam} />
