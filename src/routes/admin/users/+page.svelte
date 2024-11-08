<script lang="ts">
    import Users from "$lib/components/admin/Users.svelte";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Users config={data.config} currentUser={data.user} groups={data.groups} users={data.users} />
