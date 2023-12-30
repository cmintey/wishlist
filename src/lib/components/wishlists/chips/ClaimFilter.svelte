<script lang="ts">
    import BaseChip from "./BaseChip.svelte";

    const options: Option[] = [
        {
            value: "all",
            displayValue: "Filter"
        },
        {
            value: "claimed",
            displayValue: "Claimed"
        },
        {
            value: "unclaimed",
            displayValue: "Unclaimed"
        }
    ];

    const defaultOption = options[0];
    const searchParam = "filter";
    const prefix = "ion:filter";
</script>

<BaseChip {defaultOption} {options} {prefix} {searchParam} />
