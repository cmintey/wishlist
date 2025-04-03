<script lang="ts">
    import { smtpAcknowledged } from "$lib/stores/smtp-acknowledge";
    import { t } from "svelte-i18n";

    interface Props {
        smtpEnable: boolean;
    }

    let { smtpEnable }: Props = $props();
</script>

{#if !$smtpAcknowledged && !smtpEnable}
    <aside class="alert variant-ghost-warning mb-2">
        <div class="alert-message flex flex-row items-center space-x-4 space-y-0">
            <span><iconify-icon class="text-4xl" icon="ion:warning"></iconify-icon></span>
            <div>
                <span class="text-xl font-bold">{$t("general.smtp-is-not-enabled")}</span>
                <p class="text-sm">
                    {$t("general.smtp-not-enabled-implication")}
                </p>
            </div>
        </div>
        <div class="alert-actions w-full justify-end lg:w-fit">
            <button class="variant-filled-warning btn btn-sm" onclick={() => ($smtpAcknowledged = true)}>
                {$t("general.dismiss")}
            </button>
        </div>
    </aside>
{/if}
