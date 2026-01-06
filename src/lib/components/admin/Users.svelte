<script lang="ts">
    import { goto } from "$app/navigation";
    import { Table, tableMapperValues, tableSourceMapper, type TableSource } from "@skeletonlabs/skeleton";
    import Search from "../Search.svelte";
    import InviteUser from "./InviteUser.svelte";
    import type {Group} from "$lib/generated/prisma/client";
    import {enhance} from "$app/forms";
    import {getFormatter} from "$lib/i18n";

    type User = {
        id: string;
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

    const {users, currentUser, config, groups}: Props = $props();
    const t = getFormatter();

    let usersFiltered: (User & { groups?: string[] })[] = $state(users);

    let userData: TableSource = $derived({
        head: [$t("auth.name"), $t("auth.username"), $t("auth.email"), $t("admin.admin"), $t("admin.groups"),],
        body: tableMapperValues(formatString(usersFiltered), ["name", "username", "email", "isAdmin", "groups"]),
        meta: tableSourceMapper(formatString(usersFiltered), ["name", "username", "email", "isAdmin", "id"])
    });

    const selectionHandler = (meta: CustomEvent<string[]>) => {
        const user = meta.detail as unknown as User;
        goto(user.username === currentUser.username ? "/account" : `/admin/users/${user.id}`);
    };

    function formatString(userFiltered)  {
        return userFiltered.map(u => {
            const clone = {
                ...u,
                isAdmin : u.isAdmin ? "✅" : "❌"
            };

            return clone
        })
    }
</script>

<div class="mb-4 flex flex-col space-y-4 md:flex-row md:items-end md:gap-x-4 md:space-y-0">
    <Search data={users} keys={["name", "username"]} bind:result={usersFiltered}/>
    <form method="POST" use:enhance>
        <InviteUser {config} {groups}/>
    </form>
</div>

{#if userData}
    <Table interactive source={userData} on:selected={selectionHandler}/>
{/if}
