<script lang="ts">
    import "../app.postcss";

    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import { Modal, Toast, storePopup, type ModalComponent, initializeStores } from "@skeletonlabs/skeleton";
    import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom";
    import { pwaInfo } from "virtual:pwa-info";

    import NavBar from "$lib/components/navigation/NavBar.svelte";
    import NavigationLoadingBar from "$lib/components/navigation/NavigationLoadingBar.svelte";
    import AddUserModal from "$lib/components/modals/AddUserModal.svelte";
    import GroupSelectModal from "$lib/components/modals/GroupSelectModal.svelte";
    import InviteUserModal from "$lib/components/modals/InviteUserModal.svelte";
    import type { LayoutProps } from "./$types";
    import { onMount } from "svelte";
    import BottomTabs from "$lib/components/navigation/BottomTabs.svelte";
    import { isInstalled } from "$lib/stores/is-installed";
    import PullToRefresh from "pulltorefreshjs";
    import { navItems } from "$lib/components/navigation/navigation";
    import Drawer from "$lib/components/Drawer.svelte";
    import ClaimItemModal from "$lib/components/modals/ClaimItemModal.svelte";
    import DeleteItemModal from "$lib/components/modals/DeleteItemModal.svelte";
    import { setFormatter, setLocale } from "$lib/i18n";

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

    initializeStores();

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

    storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

    const modalComponentRegistry: Record<string, ModalComponent> = {
        addUser: {
            ref: AddUserModal
        },
        groupSelect: {
            ref: GroupSelectModal
        },
        inviteUser: {
            ref: InviteUserModal
        },
        claimItemModal: {
            ref: ClaimItemModal
        },
        deleteItem: {
            ref: DeleteItemModal
        }
    };

    const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "");
</script>

<Drawer />

<div class="min-h-screen">
    <header class="sticky top-0 z-10">
        {#if showNavigationLoadingBar}
            <NavigationLoadingBar />
        {/if}
        <NavBar isProxyUser={data.isProxyUser} {navItems} user={data.user} />
    </header>

    <main id="main" class="h-full min-h-screen px-4 py-4 md:px-12 lg:px-32 xl:px-56">
        {#if !$isInstalled && !disabled && documentTitle}
            <h1 class="h1 pb-2 md:pb-4">{documentTitle}</h1>
        {/if}
        {@render children?.()}
    </main>

    <footer class="sticky bottom-0 z-10">
        <BottomTabs {navItems} user={data.user} />
    </footer>
</div>

<Toast />
<Modal components={modalComponentRegistry} />

<svelte:head>
    {@html webManifestLink}
</svelte:head>
