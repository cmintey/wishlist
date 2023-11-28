<script lang="ts">
    import Users from "$lib/components/admin/Users.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<Users config={data.config} currentUser={data.user} groups={data.groups} users={data.users} />
