<script lang="ts">
    import { smtpAcknowledged } from "$lib/stores/smtp-acknowledge";
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
                <span class="text-xl font-bold">SMTP is not enabled</span>
                <p class="text-sm">
                    While email setup is not a requirement, users will not be able to reset their passwords via
                    self-service and you will have to manually send out links to reset passwords.
                </p>
            </div>
        </div>
        <div class="alert-actions">
            <button class="variant-filled-warning btn btn-sm" onclick={() => ($smtpAcknowledged = true)}>
                Dismiss
            </button>
        </div>
    </aside>
{/if}
