<script lang="ts">
    import { t } from "svelte-i18n";

    interface Props {
        approvalCount: number;
    }

    let { approvalCount }: Props = $props();
</script>

{#if approvalCount > 0}
    <aside class="alert variant-ghost-primary">
        <div class="alert-message flex flex-row items-center space-x-4 space-y-0">
            <div><iconify-icon class="text-4xl" icon="ion:information-circle"></iconify-icon></div>
            <div class="flex flex-col">
                <span class="text-xl font-bold">{$t("wishes.approval-needed")}</span>
                <p class="text-sm">
                    {$t("wishes.approvals-waiting", { values: { approvalCount } })}
                </p>
            </div>
        </div>
        <div class="alert-actions">
            <a class="variant-filled-primary btn btn-sm" href="/wishlists/me">{$t("wishes.view-wishes")}</a>
        </div>
    </aside>
{/if}
