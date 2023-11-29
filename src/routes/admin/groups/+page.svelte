<script lang="ts">
    import Groups from "$lib/components/admin/Groups.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<Groups groups={data.groups} />
