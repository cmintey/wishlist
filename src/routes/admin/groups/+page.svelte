<script lang="ts">
    import Groups from "$lib/components/admin/Groups.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
</script>

<Groups groups={data.groups} />
