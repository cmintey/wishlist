<script lang="ts">
    import Groups from "$lib/components/admin/Groups.svelte";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Groups groups={data.groups} />
