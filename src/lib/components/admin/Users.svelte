<script lang="ts">
    import { goto } from "$app/navigation";
    import Search from "../Search.svelte";
    import InviteUser from "./InviteUser.svelte";
    import type { Group } from "@prisma/client";
    import { enhance } from "$app/forms";
    import { getFormatter } from "$lib/i18n";

    type User = {
        username: string;
        name: string;
        email?: string;
        isAdmin: boolean;
    };

    interface Props {
        users: (User & { groups?: string[] })[];
        currentUser: User;
        config: Config;
        groups: Group[];
    }

    const { users, currentUser, config, groups }: Props = $props();
    const t = getFormatter();

    const headers = [$t("auth.name"), $t("auth.username"), $t("auth.email"), $t("admin.admin"), $t("admin.groups")];

    let usersFiltered: (User & { groups?: string[] })[] = $state(users);

    const selectionHandler = (user: User) => {
        goto(user.username === currentUser.username ? "/account" : `/admin/users/${user.username}`);
    };
</script>

<div class="mb-4 flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:gap-x-4">
    <Search data={users} keys={["name", "username"]} bind:result={usersFiltered} />
    <form method="POST" use:enhance>
        <InviteUser {config} {groups} />
    </form>
</div>

<div class="table-wrap">
    <table class="table">
        <thead>
            <tr>
                {#each headers as header}
                    <th>{header}</th>
                {/each}
            </tr>
        </thead>
        <tbody class="[&>tr]:hover:preset-tonal-primary">
            {#each usersFiltered as user}
                <tr onclick={() => selectionHandler(user)}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.isAdmin}</td>
                    <td>{user.groups}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
