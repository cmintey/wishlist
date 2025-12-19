<script lang="ts">
    import { GroupAPI } from "$lib/api/groups";
    import { getFormatter } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import AlertModal from "./AlertModal.svelte";
    import ConfirmModal from "./ConfirmModal.svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    interface Props {
        groupId: string;
        defaultGroup?: string | null;
    }

    const { groupId, defaultGroup }: Props = $props();

    const t = getFormatter();
    const groupAPI = new GroupAPI(groupId);
    const isDefaultGroup = $derived(defaultGroup === groupId);

    const onConfirm = async () => {
        const group = await groupAPI.delete();
        if (group) {
            goto("/admin/groups", { invalidateAll: true });
        }
    };
</script>

{#snippet trigger(props: HTMLButtonAttributes)}
    <button class="preset-filled-error-500 btn w-fit" {...props}>{$t("admin.delete-group-title")}</button>
{/snippet}

{#if isDefaultGroup}
    <AlertModal title={$t("errors.cannot-delete-default-group")} {trigger}>
        {#snippet description()}
            {$t("general.cannot-delete-default-group-msg")}
        {/snippet}
    </AlertModal>
{:else}
    <ConfirmModal {onConfirm} title={$t("admin.delete-group-title")} {trigger}>
        {#snippet description()}
            {@html $t("admin.delete-group-message")}
        {/snippet}
    </ConfirmModal>
{/if}
