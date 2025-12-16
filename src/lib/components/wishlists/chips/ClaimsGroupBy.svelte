<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { Segment } from "@skeletonlabs/skeleton-svelte";
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
    <Segment active="preset-filled-primary-500" padding="py-0 px-2" rounded="rounded">
        <Segment.Item name="groupby" class="text-sm" value="purchased" bind:group={groupBy}>
            {$t("wishes.purchased")}
        </Segment.Item>
        <Segment.Item name="groupby" class="text-sm" value="user" bind:group={groupBy}>{$t("general.user")}</Segment.Item>
    </Segment>
</div>
