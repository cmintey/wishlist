<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        groupBy: string;
        class?: ClassValue;
    }

    let { groupBy = $bindable() }: Props = $props();

    const t = getFormatter();
</script>

<div class="flex flex-col gap-0.5">
    <span class="text-xs">{$t("wishes.group-by")}</span>
    <RadioGroup active="variant-filled-primary" padding="py-0 px-2" rounded="rounded">
        <RadioItem name="groupby" class="text-sm" value="purchased" bind:group={groupBy}>
            {$t("wishes.purchased")}
        </RadioItem>
        <RadioItem name="groupby" class="text-sm" value="user" bind:group={groupBy}>{$t("general.user")}</RadioItem>
    </RadioGroup>
</div>
