<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import { getFormatter } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";

    interface Props extends Pick<InternalItemCardProps, "item" | "user" | "userCanManage" | "onDelete" | "onEdit"> {
        onApprove?: VoidFunction;
        onDeny?: VoidFunction;
    }

    const { item, user, userCanManage, ...props }: Props = $props();
    const t = getFormatter();
</script>

{#snippet deleteButton()}
    <button
        class="variant-filled-error btn btn-icon btn-icon-sm md:btn-icon-base"
        aria-label={$t("wishes.delete")}
        onclick={(e) => {
            e.stopPropagation();
            props.onDelete?.();
        }}
        title={$t("wishes.delete")}
    >
        <Icon icon="ion--trash"></Icon>
    </button>
{/snippet}

<div class="flex flex-row flex-wrap gap-2">
    {#if !item.approved}
        <button
            class="variant-filled-error btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.deny")}
            onclick={(e) => {
                e.stopPropagation();
                props.onDeny?.();
            }}
            title={$t("wishes.deny")}
        >
            <Icon icon="ion--close"></Icon>
        </button>
        <button
            class="variant-filled-success btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.approve")}
            onclick={(e) => {
                e.stopPropagation();
                props.onApprove?.();
            }}
            title={$t("wishes.approve")}
        >
            <Icon icon="ion--checkmark"></Icon>
        </button>
    {:else if user?.id === item.user?.id || user?.id === item.addedBy?.id}
        <button
            class="variant-ghost-primary btn btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.edit")}
            onclick={(e) => {
                e.stopPropagation();
                props.onEdit?.();
            }}
            title={$t("wishes.edit")}
        >
            <Icon icon="ion--edit"></Icon>
        </button>
        {@render deleteButton()}
    {:else if userCanManage}
        {@render deleteButton()}
    {/if}
</div>
