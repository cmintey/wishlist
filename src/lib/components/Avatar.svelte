<script lang="ts">
    import { Avatar } from "@skeletonlabs/skeleton";

    interface Props {
        user: {
            name: string;
            picture?: string | null;
        };
        [key: string]: any;
    }

    let { ...props }: Props = $props();
</script>

<Avatar
    style="height:100%"
    background="bg-primary-400-500-token"
    initials={props.user?.name.split(" ").reduce((x, y) => x + y.at(0), "")}
    src={props.user.picture ? `/api/assets/${props.user.picture}` : ""}
    {...props}
/>
