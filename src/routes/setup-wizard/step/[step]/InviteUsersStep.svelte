<script lang="ts">
    import { page } from "$app/stores";
    import InviteUser from "$lib/components/admin/InviteUser.svelte";
    import type { Group } from "@prisma/client";
    import { t } from "svelte-i18n";

    let config: Config = $derived($page.data.config);
    const groups: Group[] = $page.data.groups;
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("setup.invite-users")}</h1>
    <span>{$t("setup.invite-users-subtext")}</span>
    <InviteUser {config} defaultGroup={groups[0]} vertical />
</div>
