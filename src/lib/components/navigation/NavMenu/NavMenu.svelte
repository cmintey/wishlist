<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Role } from "$lib/schema";
    import Avatar from "../../Avatar.svelte";
    import GroupSubMenu from "./GroupSubMenu.svelte";
    import { getFormatter } from "$lib/i18n";
    import ChangeLanguageModal from "$lib/components/modals/ChangeLanguageModal.svelte";
    import LightSwitch from "./LightSwitch.svelte";
    import Popup from "$lib/components/Popup.svelte";

    interface Props {
        user: LocalUser | null;
        isProxyUser: boolean;
    }

    const { user, isProxyUser }: Props = $props();
    const t = getFormatter();
</script>

{#if user}
    <div class="flex md:pr-4">
        <Popup>
            {#snippet trigger(props)}
                <button class="h-10 md:h-12" {...props}>
                    <Avatar class="h-10 md:h-12" {user} />
                    <span class="sr-only">User Menu</span>
                </button>
            {/snippet}
            {#snippet content(props)}
                <div {...props}>
                    <nav
                        class="card preset-filled-surface-100-900 list-nav p-4 shadow-xl"
                        data-testid="user menu navigation"
                    >
                        <ul>
                            <li>
                                <a href="/account">
                                    <iconify-icon icon="ion:person"></iconify-icon>
                                    <span class="flex-auto">{$t("admin.account")}</span>
                                </a>
                            </li>
                            {#if user.roleId == Role.ADMIN}
                                <li>
                                    <a href="/admin">
                                        <iconify-icon icon="ion:settings"></iconify-icon>
                                        <span class="flex-auto">{$t("admin.admin")}</span>
                                    </a>
                                </li>
                            {/if}

                            <hr />
                            <GroupSubMenu {user} />
                            {#if !isProxyUser}
                                <hr />
                                <li>
                                    <button
                                        class="list-option w-full"
                                        onclick={async () => {
                                            await fetch("/logout", { method: "POST" });
                                            invalidateAll();
                                        }}
                                    >
                                        <iconify-icon icon="ion:log-out"></iconify-icon>
                                        <p>{$t("auth.sign-out")}</p>
                                    </button>
                                </li>
                            {/if}
                            <hr class="pb-1" />
                            <li>
                                <ChangeLanguageModal currentLanguage={user.preferredLanguage}>
                                    {#snippet trigger(props)}
                                        <button class="list-option w-full" {...props} type="button">
                                            <iconify-icon icon="ion:language"></iconify-icon>
                                            <p>{$t("general.language")}</p>
                                        </button>
                                    {/snippet}
                                </ChangeLanguageModal>
                            </li>
                            <li>
                                <div class="flex w-full justify-around pt-1">
                                    <p>{$t("general.mode")}</p>
                                    <LightSwitch />
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            {/snippet}
        </Popup>
    </div>
{:else}
    <LightSwitch />
{/if}
