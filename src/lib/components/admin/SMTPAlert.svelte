<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { smtpAcknowledged } from "$lib/stores/smtp-acknowledge";
    import Icon from "../Icon.svelte";

    interface Props {
        smtpEnable: boolean;
    }

    const { smtpEnable }: Props = $props();
    const t = getFormatter();
</script>

{#if !$smtpAcknowledged && !smtpEnable}
    <aside class="alert variant-ghost-warning mb-2">
        <div class="alert-message flex flex-row items-center gap-x-4 space-y-0">
            <Icon class="text-4xl" icon="ion--warning"></Icon>
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
