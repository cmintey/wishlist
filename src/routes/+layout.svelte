<script lang="ts">
    import "../app.postcss";

    import type { ComponentEvents } from "svelte";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import { page } from "$app/stores";
    import { AppShell, Modal, Toast, storePopup, type ModalComponent, initializeStores } from "@skeletonlabs/skeleton";
    import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom";

    import NavBar from "$lib/components/navigation/NavBar.svelte";
    import NavigationLoadingBar from "$lib/components/navigation/NavigationLoadingBar.svelte";
    import AddUserModal from "$lib/components/modals/AddUserModal.svelte";
    import GroupSelectModal from "$lib/components/modals/GroupSelectModal.svelte";
    import InviteUserModal from "$lib/components/modals/InviteUserModal.svelte";
    import type { LayoutData } from "./$types";
    import { onMount } from "svelte";
    import BottomTabs from "$lib/components/navigation/BottomTabs.svelte";
    import { isInstalled } from "$lib/stores/is-installed";
    import PullToRefresh from "pulltorefreshjs";
    import { navItems } from "$lib/components/navigation/navigation";
    import Drawer from "$lib/components/Drawer.svelte";

    export let data: LayoutData;

    const titleDisabledUrls = [
        "/login",
        "/signup",
        /^\/$/,
        "/forgot-password",
        "/reset-password",
        "/group-error",
        /\/setup-wizard\/.*/
    ];

    let showNavigationLoadingBar = false;
    let documentTitle: string | undefined;
    let disabled = false;
    let scrollPosition = 0;

    beforeNavigate(() => {
        showNavigationLoadingBar = true;
    });

    afterNavigate((params) => {
        showNavigationLoadingBar = false;
        documentTitle = document?.title;
        disabled = titleDisabledUrls.find((url) => $page.url.pathname.match(url)) !== undefined;
        // scroll to top
        const isNewPage = params.from?.url.pathname !== params.to?.url.pathname;
        const elemPage = document.querySelector("#page");
        if (isNewPage && elemPage !== null) {
            elemPage.scrollTop = 0;
        }
    });

    initializeStores();

    const scrollHandler = (event: ComponentEvents<AppShell>["scroll"]) => {
        //@ts-expect-error scrollTop doesn't exist on currentTarget
        scrollPosition = event.currentTarget?.scrollTop;
    };

    onMount(() => {
        if (window.matchMedia("(display-mode: standalone)").matches) {
            $isInstalled = true;

            const ptr = PullToRefresh.init({
                mainElement: document.getElementById("main") as unknown as string,
                distThreshold: 70,
                resistanceFunction: (t) => Math.min(1, t / 4.5),
                shouldPullToRefresh: () => scrollPosition === 0,
                onRefresh() {
                    window.location.reload();
                }
            });
            return () => ptr.destroy();
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
        }
    };
</script>

<Drawer />

<AppShell on:scroll={scrollHandler}>
    <svelte:fragment slot="header">
        {#if showNavigationLoadingBar}
            <NavigationLoadingBar />
        {/if}
        <NavBar {navItems} user={data.user} />
    </svelte:fragment>
    <!-- Router Slot -->
    <div id="main" class="px-4 py-4 md:px-12 lg:px-32 xl:px-56">
        {#if !$isInstalled && !disabled && documentTitle}
            <h1 class="h1 pb-2 md:pb-4">{documentTitle}</h1>
        {/if}
        <slot />
    </div>

    <svelte:fragment slot="footer">
        <BottomTabs {navItems} user={data.user} />
    </svelte:fragment>
</AppShell>

<Toast />
<Modal components={modalComponentRegistry} />
