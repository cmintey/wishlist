<script lang="ts">
    import "../app.postcss";

    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import { page } from "$app/stores";
    import { Modal, Toast, storePopup, type ModalComponent, initializeStores } from "@skeletonlabs/skeleton";
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
    import CreateSystemUser from "$lib/components/modals/CreateSystemUser.svelte";
    import { initLang } from "$lib/i18n";

    interface Props {
        data: LayoutData;
        children?: import("svelte").Snippet;
    }

    let { data, children }: Props = $props();

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
        /\/setup-wizard\/?.*/,
        "/lists"
    ];

    beforeNavigate(() => {
        showNavigationLoadingBar = true;
    });

    afterNavigate((params) => {
        showNavigationLoadingBar = false;
        documentTitle = document?.title;
        disabled = titleDisabledUrls.find((url) => $page.url.pathname.match(url)) !== undefined;
        if (params.type !== "popstate" && params.to?.url.pathname !== params.from?.url.pathname) {
            const elemPage = document.querySelector("#page");
            if (elemPage) elemPage.scrollTop = 0;
        }
    });

    initializeStores();

    onMount(() => {
        initLang();
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
        createSystemUser: {
            ref: CreateSystemUser
        }
    };
</script>

<Drawer />

<div class="min-h-screen">
    <header class="sticky top-0 z-10">
        {#if showNavigationLoadingBar}
            <NavigationLoadingBar />
        {/if}
        <NavBar {navItems} user={data.user} />
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
