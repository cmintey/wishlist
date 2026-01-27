<script lang="ts">
    type AlertType = "info" | "warning" | "error";
    interface Props {
        title?: string | null;
        type: AlertType;
        children?: import("svelte").Snippet;
        noicon?: boolean;
        class?: string;
    }

    let { title = null, type, noicon = false, children, class: clazz, ...rest }: Props = $props();

    const icon = type === "info" ? "information-circle" : "warning";
    const variant = type === "info" ? "primary" : type === "warning" ? "warning" : "error";
</script>

<aside class="alert preset-tonal border border-surface-500-{variant} mb-2 {clazz}" {...rest}>
    <div class="alert-message flex flex-row items-center space-y-0 gap-x-4">
        {#if !noicon}
            <span><iconify-icon class="text-4xl" icon="ion:{icon}"></iconify-icon></span>
        {/if}
        <div>
            {#if title}
                <span class="font-bold md:text-lg">{title}</span>
            {/if}
            <p>
                {@render children?.()}
            </p>
        </div>
    </div>
</aside>
