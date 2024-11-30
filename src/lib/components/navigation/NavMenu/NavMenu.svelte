<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Role } from "$lib/schema";
    import { LightSwitch, popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import Avatar from "../../Avatar.svelte";
    import type { User } from "lucia";
    import GroupSubMenu from "./GroupSubMenu.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        user: User | null;
    }

    let { user }: Props = $props();

    const menuSettings: PopupSettings = {
        event: "click",
        target: "user"
    };
</script>

{#if user}
    <div class="flex md:pr-4">
        <button class="h-10 md:h-12" use:popup={menuSettings}>
            <Avatar {user} width="h-10 md:h-12" />
        </button>
        <div>
            <nav class="card list-nav p-4 shadow-xl" data-popup="user">
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
                    <hr class="pb-1" />
                    <li>
                        <div class="flex w-full justify-around">
                            <p>{$t("general.mode")}</p>
                            <LightSwitch />
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
{:else}
    <LightSwitch />
{/if}
