<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        groupBy: string | null;
        class?: ClassValue;
    }

    let { groupBy = $bindable() }: Props = $props();

    const t = getFormatter();
</script>

<SegmentedControl class="z-5 gap-1" onValueChange={(e) => (groupBy = e.value)} value={groupBy}>
    <SegmentedControl.Label>
        {#snippet element(props)}
            <span {...props} class="text-xs">{$t("wishes.group-by")}</span>
        {/snippet}
    </SegmentedControl.Label>
    <SegmentedControl.Control class="rounded-container h-6.5 gap-1 p-px">
        <SegmentedControl.Indicator class="preset-filled-primary-500 rounded-container" />
        <SegmentedControl.Item value="purchased">
            <SegmentedControl.ItemText class="text-xs">
                {$t("wishes.purchased")}
            </SegmentedControl.ItemText>
            <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="user">
            <SegmentedControl.ItemText class="text-xs">
                {$t("general.user")}
            </SegmentedControl.ItemText>
            <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
    </SegmentedControl.Control>
</SegmentedControl>
