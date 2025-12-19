<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { LocalStorage } from "$lib/local-storage.svelte";
    import { SegmentedControl, type SegmentedControlRootProps } from "@skeletonlabs/skeleton-svelte";

    const t = getFormatter();

    const options = [
        { value: "system", icon: "ion:desktop-outline", text: $t("general.system") },
        { value: "light", icon: "ion:sunny-outline", text: $t("general.light") },
        { value: "dark", icon: "ion:moon-outline", text: $t("general.dark") }
    ];

    const modeLocalStorage = new LocalStorage<string | null>("mode", "system");

    let value = $state("system");

    $effect(() => {
        value = modeLocalStorage.current || "system";
        if (value === "system") {
            document.documentElement.removeAttribute("data-mode");
        } else {
            document.documentElement.setAttribute("data-mode", value);
        }
    });

    const onValueChange: SegmentedControlRootProps["onValueChange"] = (details) => {
        const mode = details.value;

        if (!mode || mode === "system") {
            modeLocalStorage.current = null;
        } else {
            modeLocalStorage.current = mode;
        }
    };
</script>

<SegmentedControl {onValueChange} {value}>
    <SegmentedControl.Label>{$t("general.mode")}</SegmentedControl.Label>
    <SegmentedControl.Control class="p-1">
        <SegmentedControl.Indicator />
        {#each options as { value, icon, text } (value)}
            <SegmentedControl.Item {value}>
                <SegmentedControl.ItemText class="flex size-4" title={text}>
                    <iconify-icon class="mt-0.5" {icon}></iconify-icon>
                    <span class="sr-only">{text}</span>
                </SegmentedControl.ItemText>
                <SegmentedControl.ItemHiddenInput />
            </SegmentedControl.Item>
        {/each}
    </SegmentedControl.Control>
</SegmentedControl>

<svelte:head>
    <script lang="ts">
        let mode =
            typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("mode")) || "system" : "system";

        if (mode === "system") {
            document.documentElement.removeAttribute("data-mode");
        } else {
            document.documentElement.setAttribute("data-mode", mode);
        }
    </script>
</svelte:head>
