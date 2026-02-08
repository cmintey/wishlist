<script lang="ts">
    import { Avatar } from "@skeletonlabs/skeleton-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        user?: {
            name: string;
            picture?: string | null;
        };
        class: ClassValue;
    }

    let { user, ...props }: Props = $props();
</script>

<Avatar {...props}>
    <Avatar.Image src={user?.picture ? `/api/assets/${user.picture}` : null}></Avatar.Image>
    <Avatar.Fallback class="preset-filled-primary-500">
        {user?.name.split(" ").reduce((x, y) => x + y.at(0), "")}
    </Avatar.Fallback>
</Avatar>
