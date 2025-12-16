<script lang="ts">
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import logo from "$lib/assets/logo.png";
    import { Dialog, Portal, type DialogTriggerProps } from "@skeletonlabs/skeleton-svelte";
    import ModalBackdrop from "../modals/parts/ModalBackdrop.svelte";
    import ModalContent from "../modals/parts/ModalContent.svelte";

    interface Props {
        trigger: DialogTriggerProps["element"];
        navItems: NavItem[];
        user: LocalUser | undefined;
    }

    const { trigger, navItems, user }: Props = $props();
    const t = getFormatter();

    let open = $state(false);
</script>

<Dialog onOpenChange={(e) => (open = e.open)} {open}>
    <Dialog.Trigger element={trigger}></Dialog.Trigger>
    <Portal>
        <ModalBackdrop></ModalBackdrop>
        <Dialog.Positioner class="fixed inset-0 z-50 flex justify-start">
            <ModalContent>
                <header class="flex items-center justify-between">
                    <Dialog.Title class="text-4xl font-bold">Wishlist</Dialog.Title>
                    <Dialog.CloseTrigger class="btn-icon preset-tonal">
                        <iconify-icon icon="ion:close" width="32"></iconify-icon>
                        <span class="sr-only">{$t("a11y.close")}</span>
                    </Dialog.CloseTrigger>
                </header>

                <nav class="list-nav p-4">
                    <ul>
                        {#each navItems as navItem}
                            <li>
                                <a
                                    class="list-option gap-x-1 font-bold"
                                    class:preset-filled-primary-500={page.url.pathname + page.url.search ===
                                        navItem.href(user)}
                                    data-sveltekit-preload-data
                                    href={navItem.href(user)}
                                    onclick={() => (open = false)}
                                >
                                    <iconify-icon class="text-xl" icon={navItem.icon}></iconify-icon>
                                    <p>{$t(navItem.labelKey)}</p>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </ModalContent>
        </Dialog.Positioner>
    </Portal>
</Dialog>
