<script lang="ts">
    type AlertType = "info" | "warning" | "error";
    export let title: string | null = null;
    export let type: AlertType;

    const icon = type === "info" ? "information-circle" : "warning";
    const variant = type === "info" ? "primary" : type === "warning" ? "warning" : "error";
</script>

<aside class="alert variant-ghost-{variant} mb-2">
    <div class="alert-message flex flex-row items-center space-x-4 space-y-0">
        <span><iconify-icon class="text-4xl" icon="ion:{icon}" /></span>
        <div>
            {#if title}
                <span class="text-xl font-bold">{title}</span>
            {/if}
            <p>
                <slot />
            </p>
        </div>
    </div>
</aside>
