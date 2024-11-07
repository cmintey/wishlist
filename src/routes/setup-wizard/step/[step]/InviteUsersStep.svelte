<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import { page } from "$app/stores";
    import InviteUser from "$lib/components/admin/InviteUser.svelte";
    import type { Group } from "@prisma/client";

    $: config = $page.data.config satisfies Config;
    const groups: Group[] = $page.data.groups;
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">Invite Users</h1>
    <span>
        If you're ready, invite some additional users! You can always invite users later from the admin or group
        settings.
    </span>

    <form
        action="/admin/users"
        method="POST"
        use:enhance={() => {
            return async ({ result }) => await applyAction(result);
        }}
    >
        <InviteUser {config} defaultGroup={groups[0]} vertical />
    </form>
</div>
