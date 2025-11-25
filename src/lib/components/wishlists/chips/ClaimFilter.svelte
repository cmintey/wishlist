<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import BaseChip from "./BaseChip.svelte";

    const t = getFormatter();
    const options: Option[] = [
        {
            value: "all",
            displayValue: $t("general.all")
        },
        {
            value: "claimed",
            displayValue: $t("wishes.claimed")
        },
        {
            value: "unclaimed",
            displayValue: $t("wishes.unclaimed")
        }
    ];

    const label = $t("wishes.filter");
    const defaultOption = options[0];
    const searchParam = "filter";
    const prefix = "ion:filter";
</script>

<BaseChip {defaultOption} {label} {options} {prefix} {searchParam} />
