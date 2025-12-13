<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Role } from "$lib/schema";
    import { getModalStore, LightSwitch, popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import Avatar from "../../Avatar.svelte";
    import GroupSubMenu from "./GroupSubMenu.svelte";
    import { getFormatter } from "$lib/i18n";
    import GroupSelectChip from "$lib/components/wishlists/chips/GroupSelectChip.svelte";
    import Icon from "$lib/components/Icon.svelte";

    interface Props {
        user: LocalUser | null;
        groups: GroupInformation[] | null;
        isProxyUser: boolean;
    }

    const { user, groups, isProxyUser }: Props = $props();
    const t = getFormatter();
    const modalStore = getModalStore();

    const menuSettings: PopupSettings = {
        event: "click",
        target: "user"
    };

    const chooseLanguage = () => {
        modalStore.trigger({
            type: "component",
            component: "chooseLanguage",
            meta: {
                currentLanguage: user?.preferredLanguage
            }
        });
    };
</script>

{#if user}
    <div class="flex min-w-0 items-center gap-4">
        {#if groups && groups?.length > 1}
            <GroupSelectChip {groups} {user} />
        {/if}
        <button class="h-10 md:h-12" use:popup={menuSettings}>
            <Avatar {user} width="h-10 md:h-12" />
            <span class="sr-only">User Menu</span>
        </button>
    </div>
    <nav class="card list-nav p-4 shadow-xl" data-popup="user" data-testid="user menu navigation">
        <ul>
            <li>
                <a href="/account">
                    <Icon icon="ion--person"></Icon>
                    <span class="flex-auto">{$t("admin.account")}</span>
                </a>
            </li>
            {#if user.roleId == Role.ADMIN}
                <li>
                    <a href="/admin">
                        <Icon icon="ion--settings"></Icon>
                        <span class="flex-auto">{$t("admin.admin")}</span>
                    </a>
                </li>
            {/if}

            <hr />
            <GroupSubMenu {groups} {user} />
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
                        <Icon icon="ion--log-out"></Icon>
                        <p>{$t("auth.sign-out")}</p>
                    </button>
                </li>
            {/if}
            <hr class="pb-1" />
            <li>
                <button class="list-option w-full" onclick={chooseLanguage} type="button">
                    <Icon icon="ion--language"></Icon>
                    <p>{$t("general.language")}</p>
                </button>
            </li>
            <li>
                <div class="list-option flex items-center gap-2 pt-1">
                    <p>{$t("general.mode")}</p>
                    <LightSwitch title={$t("general.toggle-dark-mode")} />
                </div>
            </li>
        </ul>
    </nav>
{:else}
    <LightSwitch />
{/if}
