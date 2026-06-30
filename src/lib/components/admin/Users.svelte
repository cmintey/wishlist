<script lang="ts">
    import { goto } from "$app/navigation";
    import Search from "../Search.svelte";
    import InviteUser from "./InviteUser.svelte";
    import type { Group } from "$lib/generated/prisma/client";
    import { enhance } from "$app/forms";
    import { getFormatter } from "$lib/i18n";

    type User = {
        id: string;
        username: string;
        name: string;
        email?: string;
        isAdmin: boolean;
    };

    type UserWithGroups = User & { groups?: string[] };

    interface Props {
        users: UserWithGroups[];
        currentUser: User;
        config: Config;
        groups: Group[];
    }

    const { users, currentUser, config, groups }: Props = $props();
    const t = getFormatter();

    const headers = [$t("auth.name"), $t("auth.username"), $t("auth.email"), $t("admin.admin"), $t("admin.groups")];

    let usersFiltered: UserWithGroups[] = $derived(users);

    const selectionHandler = (user: User) => {
        goto(user.username === currentUser.username ? "/account" : `/admin/users/${user.id}`);
    };
</script>

<div class="mb-4 flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:gap-x-4">
    <Search data={users} keys={["name", "username"]} bind:result={usersFiltered} />
    <form method="POST" use:enhance>
        <InviteUser {config} {groups} />
    </form>
</div>

<div class="table-wrap preset-outlined-surface-200-800 rounded-container">
    <table class="table-hover table">
        <thead>
            <tr>
                {#each headers as header}
                    <th>{header}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each usersFiltered as user}
                <tr onclick={() => selectionHandler(user)}>
                    <td class="text-nowrap">{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td class="text-center">
                        {#if user.isAdmin}
                            <iconify-icon class="text-lg" icon="ion:checkmark"></iconify-icon>
                        {/if}
                    </td>
                    <td class="flex flex-wrap gap-1">
                        {#each user.groups?.toSorted() as group}
                            <span class="badge preset-tonal-secondary inset-ring-secondary-500 inset-ring">
                                {group}
                            </span>
                        {/each}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
