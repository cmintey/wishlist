<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { Switch } from "@skeletonlabs/skeleton-svelte";

    const t = getFormatter();
    let checked = $state(false);

    $effect(() => {
        const mode = localStorage.getItem("mode") || "light";
        checked = mode === "dark";
    });

    const onCheckedChange = (event: { checked: boolean }) => {
        const mode = event.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-mode", mode);
        localStorage.setItem("mode", mode);
        checked = event.checked;
    };
</script>

<Switch {checked} {onCheckedChange} title={$t("general.toggle-dark-mode")}></Switch>

<svelte:head>
    <script>
        const mode = localStorage.getItem("mode") || "light";
        document.documentElement.setAttribute("data-mode", mode);
    </script>
</svelte:head>
