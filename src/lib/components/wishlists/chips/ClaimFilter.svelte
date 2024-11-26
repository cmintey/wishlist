<script lang="ts">
    import BaseChip from "./BaseChip.svelte";
    import { t } from "svelte-i18n";

    const options: Option[] = [
        {
            value: "all",
            displayValue: $t("wishes.filter")
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

    const defaultOption = options[0];
    const searchParam = "filter";
    const prefix = "ion:filter";
</script>

<BaseChip {defaultOption} {options} {prefix} {searchParam} />
