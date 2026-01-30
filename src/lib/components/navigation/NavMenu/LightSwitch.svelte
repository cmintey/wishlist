<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { LocalStorage } from "$lib/local-storage.svelte";
    import { SegmentedControl, type SegmentedControlRootProps } from "@skeletonlabs/skeleton-svelte";
    import { onMount } from "svelte";

    const t = getFormatter();

    const options = [
        { value: "system", icon: "ion:desktop-outline", text: $t("general.system") },
        { value: "light", icon: "ion:sunny-outline", text: $t("general.light") },
        { value: "dark", icon: "ion:moon-outline", text: $t("general.dark") }
    ];

    const modeLocalStorage = new LocalStorage<string>("mode", "system");

    let value = $state("system");

    const setPreference = (pref: string) => {
        document.documentElement.setAttribute("data-mode", pref);
    };

    $effect(() => {
        value = modeLocalStorage.current;
        if (value === "system") {
            const pref = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setPreference(pref);
        } else {
            setPreference(value);
        }
    });

    onMount(() => {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            if (value === "system") {
                setPreference(e.matches ? "dark" : "light");
            }
        });
    });

    const onValueChange: SegmentedControlRootProps["onValueChange"] = (details) => {
        modeLocalStorage.current = details.value || "system";
    };
</script>

<SegmentedControl {onValueChange} {value}>
    <SegmentedControl.Label>{$t("general.mode")}</SegmentedControl.Label>
    <SegmentedControl.Control class="p-0.5">
        <SegmentedControl.Indicator />
        {#each options as { value, icon, text } (value)}
            <SegmentedControl.Item {value}>
                <SegmentedControl.ItemText class="flex size-4" title={text}>
                    <iconify-icon {icon}></iconify-icon>
                    <span class="sr-only">{text}</span>
                </SegmentedControl.ItemText>
                <SegmentedControl.ItemHiddenInput />
            </SegmentedControl.Item>
        {/each}
    </SegmentedControl.Control>
</SegmentedControl>

<svelte:head>
    <script>
        (function initMode() {
            let mode =
                typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("mode")) || "system" : "system";
            if (mode === "system") {
                const pref = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                document.documentElement.setAttribute("data-mode", pref);
            } else {
                document.documentElement.setAttribute("data-mode", mode);
            }
        })();
    </script>
</svelte:head>
