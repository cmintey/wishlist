<script lang="ts">
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import { Dialog, Portal, type DialogTriggerProps } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        trigger: DialogTriggerProps["element"];
        navItems: NavItem[];
    }

    const { trigger, navItems }: Props = $props();
    const t = getFormatter();

    let open = $state(false);
</script>

<Dialog onOpenChange={(e) => (open = e.open)} {open}>
    <Dialog.Trigger element={trigger}></Dialog.Trigger>
    <Portal>
        <Dialog.Backdrop
            class="bg-surface-50-950/50 fixed inset-0 z-50 w-[280px] opacity-0 transition transition-discrete data-[state=open]:opacity-100 md:w-[480px] starting:data-[state=open]:opacity-0"
        />
        <Dialog.Positioner class="fixed inset-0 z-50 flex justify-start">
            <Dialog.Content class="mt-4 flex flex-row place-content-between items-center px-4">
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
                                    class:preset-filled-primary-500={page.url.pathname === navItem.href}
                                    data-sveltekit-preload-data
                                    href={navItem.href}
                                    onclick={() => (open = false)}
                                >
                                    <iconify-icon class="text-xl" icon={navItem.icon}></iconify-icon>
                                    <p>{$t(navItem.labelKey)}</p>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </Dialog.Content>
        </Dialog.Positioner>
    </Portal>
</Dialog>
