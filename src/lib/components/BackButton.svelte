<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import logo from "$lib/assets/logo.png";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        label?: string;
    }

    const t = getFormatter();
    const { label = $t("setup.back") }: Props = $props();
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

    let documentTitle: string | undefined = $state();
    let disabled = $state(true);

    afterNavigate(() => {
        documentTitle = document?.title;
        disabled = disabledUrls.find((url) => page.url.pathname.match(url)) !== undefined;
    });
</script>

{#if disabled}
    <a class="flex flex-row items-center gap-x-2" href="/">
        <img class="h-10 md:h-12" alt="Wishlist Logo" src={logo} />
        <span class="text-primary-900-50-token text-2xl font-bold md:text-3xl">Wishlist</span>
    </a>
{:else}
    <button class="btn w-fit p-0" aria-label={$t("setup.back")} onclick={() => history.back()} type="button">
        <iconify-icon icon="ion:arrow-back"></iconify-icon>
        <span class="text-xl">{documentTitle || label}</span>
    </button>
{/if}
