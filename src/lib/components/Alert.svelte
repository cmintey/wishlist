<script lang="ts">
    import Icon from "./Icon.svelte";

    type AlertType = "info" | "warning" | "error";
    interface Props {
        title?: string | null;
        type: AlertType;
        children?: import("svelte").Snippet;
        noicon?: boolean;
        class?: string;
    }

    let { title = null, type, noicon = false, children, class: clazz, ...rest }: Props = $props();

    const icon = type === "info" ? "ion--information-circle" : "ion--warning";
    const variant =
        type === "info"
            ? "variant-ghost-primary"
            : type === "warning"
              ? "variang-ghost-warning"
              : "variant-ghost-error";
</script>

<aside class="alert {variant} mb-2 {clazz}" {...rest}>
    <div class="alert-message flex flex-row items-center gap-x-4 space-y-0">
        {#if !noicon}
            <Icon class="text-4xl" {icon}></Icon>
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
