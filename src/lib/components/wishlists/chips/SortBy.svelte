<script lang="ts">
    import BaseChip from "./BaseChip.svelte";
    import { t } from "svelte-i18n";

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

    const defaultOption = options[0];
    const searchParam = "sort";
    const directionParam = "dir";
    const prefix = "ion:swap-vertical";
</script>

<BaseChip {defaultOption} {directionParam} {options} {prefix} {searchParam} />
