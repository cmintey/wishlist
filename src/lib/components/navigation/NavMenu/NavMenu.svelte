<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { Role } from "$lib/schema";
    import { LightSwitch, popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import Avatar from "../../Avatar.svelte";
    import type { User } from "lucia";
    import GroupSubMenu from "./GroupSubMenu.svelte";

    export let user: User | null;

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
                            <iconify-icon icon="ion:person" />
                            <span class="flex-auto">Account</span>
                        </a>
                    </li>
                    {#if user.roleId == Role.ADMIN}
                        <li>
                            <a href="/admin">
                                <iconify-icon icon="ion:settings" />
                                <span class="flex-auto">Admin</span>
                            </a>
                        </li>
                    {/if}

                    <hr />
                    <GroupSubMenu {user} />
                    <hr />

                    <li>
                        <button
                            class="list-option w-full"
                            on:click={async () => {
                                await fetch("/logout", { method: "POST" });
                                invalidateAll();
                            }}
                        >
                            <iconify-icon icon="ion:log-out" />
                            <p>Sign Out</p>
                        </button>
                    </li>
                    <hr class="pb-1" />
                    <li>
                        <div class="flex w-full justify-around">
                            <p>Mode</p>
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
