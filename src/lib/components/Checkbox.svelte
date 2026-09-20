<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends Omit<HTMLInputAttributes, "id" | "type"> {
        description?: Snippet;
    }

    let { checked = $bindable(), children, description, ...props }: Props = $props();
    let _id = $props.id();
    let id = $derived(props.name || _id);
    let descriptionId = $derived(_id + "_desc");
</script>

{#snippet checkbox()}
    <div class="flex flex-row items-center gap-x-2">
        <input
            {id}
            class={["checkbox", props.class]}
            type="checkbox"
            bind:checked
            {...props}
            aria-describedby={description && descriptionId}
        />
        <label class={[props.disabled && "disabled cursor-not-allowed"]} for={id}>{@render children?.()}</label>
    </div>
{/snippet}

{#if description}
    <div class="flex w-full flex-col">
        {@render checkbox()}
        <span id={descriptionId} class="subtext">
            {@render description()}
        </span>
    </div>
{:else}
    {@render checkbox()}
{/if}
