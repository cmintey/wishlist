<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        icon: string;
        class?: ClassValue;
        dynamic?: boolean;
    }

    const { icon, dynamic = false, ...rest }: Props = $props();
</script>

<span class={[!dynamic && "iconify", icon, rest.class]}></span>
