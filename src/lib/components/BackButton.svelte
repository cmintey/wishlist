<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import { page } from "$app/stores";
    import logo from "$lib/assets/logo.png";

    export let label = "Back";
    const disabledUrls = ["/login", "/signup", "/", "/forgot-password", "/reset-password", "/group-error"];

    let documentTitle: string | undefined;
    let disabled = true;

    afterNavigate(() => {
        documentTitle = document?.title;
        disabled = disabledUrls.find((url) => $page.url.pathname === url) !== undefined;
    });
</script>

{#if disabled}
    <a class="flex flex-row items-center space-x-2" href="/">
        <img class="h-10 md:h-12" alt="Wishlist Logo" src={logo} />
        <span class="text-primary-900-50-token text-2xl font-bold md:text-3xl">Wishlist</span>
    </a>
{:else}
    <button class="btn w-fit p-0" type="button" on:click={() => history.back()}>
        <iconify-icon icon="ion:arrow-back" />
        <span class="text-xl">{documentTitle || label}</span>
    </button>
{/if}
