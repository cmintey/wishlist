<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { smtpAcknowledged } from "$lib/stores/smtp-acknowledge";

    interface Props {
        smtpEnable: boolean;
    }

    const { smtpEnable }: Props = $props();
    const t = getFormatter();
</script>

{#if !$smtpAcknowledged && !smtpEnable}
    <aside class="alert preset-tonal-warning border-warning-500 mb-2 border">
        <div class="alert-message flex flex-row items-center space-y-0 gap-x-4">
            <span><iconify-icon class="text-4xl" icon="ion:warning"></iconify-icon></span>
            <div>
                <span class="text-xl font-bold">{$t("general.smtp-is-not-enabled")}</span>
                <p class="text-sm">
                    {$t("general.smtp-not-enabled-implication")}
                </p>
            </div>
        </div>
        <div class="alert-actions w-full justify-end lg:w-fit">
            <button class="preset-filled-warning-500 btn btn-sm" onclick={() => ($smtpAcknowledged = true)}>
                {$t("general.dismiss")}
            </button>
        </div>
    </aside>
{/if}
