<script lang="ts">
    import Users from "$lib/components/admin/Users.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
</script>

<Users config={data.config} currentUser={data.user} groups={data.groups} users={data.users} />
