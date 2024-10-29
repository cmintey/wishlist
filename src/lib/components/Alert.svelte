<script lang="ts">
    type AlertType = "info" | "warning" | "error";
    interface Props {
        title?: string | null;
        type: AlertType;
        children?: import('svelte').Snippet;
    }

    let { title = null, type, children }: Props = $props();

    const icon = type === "info" ? "information-circle" : "warning";
    const variant = type === "info" ? "primary" : type === "warning" ? "warning" : "error";
</script>

<aside class="alert variant-ghost-{variant} mb-2">
    <div class="alert-message flex flex-row items-center space-x-4 space-y-0">
        <span><iconify-icon class="text-4xl" icon="ion:{icon}"></iconify-icon></span>
        <div>
            {#if title}
                <span class="text-xl font-bold">{title}</span>
            {/if}
            <p>
                {@render children?.()}
            </p>
        </div>
    </div>
</aside>
