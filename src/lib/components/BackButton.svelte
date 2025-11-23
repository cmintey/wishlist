<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import type { Snippet } from "svelte";

    interface Props {
        header: Snippet;
    }

    const t = getFormatter();
    const { header }: Props = $props();
    const disabledUrls = [
        "/login",
        "/signup",
        /^\/$/,
        "/forgot-password",
        "/reset-password",
        "/group-error",
        /\/setup-wizard\/?.*/,
        /^\/lists$/
    ];

    let disabled = $state(true);

    afterNavigate(() => {
        disabled = disabledUrls.find((url) => page.url.pathname.match(url)) !== undefined;
    });
</script>

{#if disabled}
    {@render header()}
{:else}
    <button class="btn w-fit p-0" aria-label={$t("setup.back")} onclick={() => history.back()} type="button">
        <iconify-icon class="mt-0.5" icon="ion:arrow-back"></iconify-icon>
        <span class="truncate text-xl">{$t("setup.back")}</span>
    </button>
{/if}
