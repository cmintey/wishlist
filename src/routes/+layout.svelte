<script lang="ts">
    import "../app.css";

    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import { pwaInfo } from "virtual:pwa-info";

    import NavBar from "$lib/components/navigation/NavBar.svelte";
    import NavigationLoadingBar from "$lib/components/navigation/NavigationLoadingBar.svelte";
    import type { LayoutProps } from "./$types";
    import { onMount } from "svelte";
    import BottomTabs from "$lib/components/navigation/BottomTabs.svelte";
    import { isInstalled } from "$lib/stores/is-installed";
    import PullToRefresh from "pulltorefreshjs";
    import { navItems } from "$lib/components/navigation/navigation";
    import { setFormatter, setLocale } from "$lib/i18n";
    import Toaster from "$lib/components/toaster/Toaster.svelte";

    const { data, children }: LayoutProps = $props();

    let showNavigationLoadingBar = $state(false);
    let documentTitle: string | undefined = $state();
    let disabled = $state(false);

    const titleDisabledUrls = [
        "/login",
        "/signup",
        /^\/$/,
        "/forgot-password",
        "/reset-password",
        "/group-error",
        /\/setup-wizard\/?.*/
    ];

    setFormatter(data.t);
    setLocale(data.locale);

    beforeNavigate(() => {
        showNavigationLoadingBar = true;
    });

    afterNavigate((params) => {
        showNavigationLoadingBar = false;
        documentTitle = document?.title;
        disabled = titleDisabledUrls.find((url) => page.url.pathname.match(url)) !== undefined;
        if (params.type !== "popstate" && params.to?.url.pathname !== params.from?.url.pathname) {
            const elemPage = document.querySelector("#page");
            if (elemPage) elemPage.scrollTop = 0;
        }
    });

    onMount(() => {
        if (window.matchMedia("(display-mode: standalone)").matches) {
            $isInstalled = true;
            const ptr = PullToRefresh.init({
                mainElement: document.getElementById("main") as unknown as string,
                distThreshold: 70,
                resistanceFunction: (t) => Math.min(1, t / 4.5),
                onRefresh() {
                    window.location.reload();
                }
            });
            return () => ptr.destroy();
        }
    });

    onMount(async () => {
        if (pwaInfo) {
            const { registerSW } = await import("virtual:pwa-register");
            registerSW({
                immediate: true,
                onRegistered(r) {
                    console.log(`SW Registered: ${r}`);
                },
                onRegisterError(error) {
                    console.log("SW registration error", error);
                }
            });
        }
    });

    const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "");
</script>

<div class="min-h-screen">
    <header class="sticky top-0 z-10 print:hidden">
        {#if showNavigationLoadingBar}
            <NavigationLoadingBar />
        {/if}
        <NavBar groups={data.groups} isProxyUser={data.isProxyUser} {navItems} user={data.user} />
    </header>

    <main id="main" class="h-full min-h-screen px-4 py-4 md:px-12 lg:px-32 xl:px-56">
        {#if !disabled && documentTitle}
            <h1 class="h1 pb-2 md:pb-4">{documentTitle}</h1>
        {/if}
        {@render children?.()}
    </main>

    <footer class="sticky bottom-0 z-10 print:hidden">
        <BottomTabs {navItems} user={data.user} />
    </footer>
</div>

<Toaster />

<svelte:head>
    {@html webManifestLink}
</svelte:head>
