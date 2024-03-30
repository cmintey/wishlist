<script lang="ts">
    import { Avatar } from "@skeletonlabs/skeleton";

    export let user: {
        name: string;
        picture?: string | null;
    };
</script>

<Avatar
    style="height:100%"
    background="bg-primary-400-500-token"
    initials={user?.name.split(" ").reduce((x, y) => x + y.at(0), "")}
    src={user.picture ? `/api/assets/${user.picture}` : ""}
    {...$$props}
/>
