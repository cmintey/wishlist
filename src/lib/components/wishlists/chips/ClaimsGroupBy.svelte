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

<div class="flex flex-col gap-0.5">
    <span class="text-xs">{$t("wishes.group-by")}</span>
    <SegmentedControl onValueChange={(e) => (groupBy = e.value)} value={groupBy}>
        <SegmentedControl.Control class="h-7 p-px">
            <SegmentedControl.Indicator class="preset-filled-primary-500" />
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
</div>
