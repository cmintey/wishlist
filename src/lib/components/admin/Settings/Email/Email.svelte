<script lang="ts">
    import SettingsGroup from "../SettingsGroup.svelte";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import SmtpAlert from "../../SMTPAlert.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<Config, "smtp">;
        sending: boolean;
        hidden?: boolean;
    }

    const { config: config_, sending, hidden = false }: Props = $props();
    const t = getFormatter();

    let config = $state(config_);
    let enabled = $state(config.smtp.enable);
    let allFilled = $derived(
        enabled && config.smtp.from && config.smtp.fromName && config.smtp.host && config.smtp.port
    );
</script>

<div class={{ hidden, "flex flex-col gap-4": !hidden }}>
    <h2 class="h2">{$t("auth.email")}</h2>

    <SmtpAlert smtpEnable={enabled} />

    <SettingsGroup title={$t("admin.smtp")}>
        <label class="checkbox-label">
            <input id="enableSMTP" name="enableSMTP" class="checkbox" type="checkbox" bind:checked={enabled} />
            <span>{$t("general.enable")}</span>
        </label>
        {#if enabled}
            <div class="grid grid-cols-1 gap-x-4 gap-y-2 pb-1 md:grid-cols-2">
                <label class="label" for="smtpHost">
                    <span>{$t("admin.smtp-host")}</span>
                    <input
                        id="smtpHost"
                        name="smtpHost"
                        class="input"
                        autocomplete="off"
                        required
                        type="text"
                        bind:value={config.smtp.host}
                    />
                </label>
                <label class="label" for="smtpPort">
                    <span>{$t("admin.smtp-port")}</span>
                    <input
                        id="smtpPort"
                        name="smtpPort"
                        class="input"
                        autocomplete="off"
                        required
                        type="text"
                        bind:value={config.smtp.port}
                    />
                </label>
                <label class="label" for="smtpUser">
                    <span>{$t("general.user")}</span>
                    <input
                        id="smtpUser"
                        name="smtpUser"
                        class="input"
                        autocomplete="off"
                        type="text"
                        bind:value={config.smtp.user}
                    />
                </label>
                <PasswordInput
                    id="smtpPass"
                    name="smtpPass"
                    label={$t("auth.password")}
                    bind:value={config.smtp.pass}
                />
                <label class="label" for="smtpFrom">
                    <span>{$t("admin.smtp-from-email")}</span>
                    <input
                        id="smtpFrom"
                        name="smtpFrom"
                        class="input"
                        autocomplete="off"
                        required
                        type="text"
                        bind:value={config.smtp.from}
                    />
                </label>
                <label class="label" for="smtpFromName">
                    <span>{$t("admin.smtp-from-name")}</span>
                    <input
                        id="smtpFromName"
                        name="smtpFromName"
                        class="input"
                        autocomplete="off"
                        required
                        type="text"
                        bind:value={config.smtp.fromName}
                    />
                </label>
            </div>
            <div class="flex w-full flex-row justify-end">
                <button
                    class="preset-tonal-primary border-primary-500 btn mt-2 h-min w-fit border"
                    disabled={!allFilled || sending}
                    formaction="/admin/settings?/send-test"
                    type="submit"
                >
                    {#if sending}
                        <span class="loading loading-spinner loading-xs"></span>
                    {:else}
                        {$t("admin.test-email")}
                    {/if}
                </button>
            </div>
        {/if}
    </SettingsGroup>
</div>
