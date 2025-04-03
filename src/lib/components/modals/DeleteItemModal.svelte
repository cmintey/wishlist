<script lang="ts" module>
    export enum DeleteConfirmationResult {
        CANCEL,
        REMOVE,
        DELETE
    }
</script>

<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { t } from "svelte-i18n";

    const modalStore = getModalStore();

    function onClose(): void {
        if ($modalStore[0].response) $modalStore[0].response(DeleteConfirmationResult.CANCEL);
        modalStore.close();
    }

    function onRemove(): void {
        if ($modalStore[0].response) $modalStore[0].response(DeleteConfirmationResult.REMOVE);
        modalStore.close();
    }

    function onDelete(): void {
        if ($modalStore[0].response) $modalStore[0].response(DeleteConfirmationResult.DELETE);
        modalStore.close();
    }
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    {#if $modalStore[0]?.title}
        <header class="modal-header text-2xl font-bold">{@html $modalStore[0].title}</header>
    {/if}

    {#if $modalStore[0]?.body}
        <article class="modal-body max-h-[200px] overflow-hidden">{@html $modalStore[0].body}</article>
    {/if}

    <footer class="modal-footer flex flex-wrap justify-between gap-y-2">
        <button class="variant-ghost-surface btn btn-sm md:btn-md" onclick={onClose} type="button">
            {$t("general.cancel")}
        </button>
        {#if $modalStore[0].meta.multipleLists}
            <div class="flex flex-wrap gap-2">
                <button class="variant-filled-error btn btn-sm md:btn-md" onclick={onDelete} type="button">
                    {$t("wishes.all-lists")}
                </button>
                <button class="variant-filled-primary btn btn-sm md:btn-md" onclick={onRemove} type="button">
                    {$t("wishes.this-list")}
                </button>
            </div>
        {:else}
            <button class="variant-filled btn btn-sm md:btn-md" onclick={onDelete} type="button">
                {$t("general.confirm")}
            </button>
        {/if}
    </footer>
</div>
