<script lang="ts">
    import SettingsGroup from "../SettingsGroup.svelte";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import SmtpAlert from "../../SMTPAlert.svelte";
    import { Progress } from "@skeletonlabs/skeleton-svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<Config, "smtp">;
        sending: boolean;
        saved: boolean;
        hidden?: boolean;
    }

    const { config, saved, sending, hidden = false }: Props = $props();
    const t = getFormatter();
</script>

<div class={{ hidden, "flex flex-col gap-4": !hidden }}>
    <h2 class="h2">{$t("auth.email")}</h2>

    <SmtpAlert smtpEnable={config.smtp.enable} />

    <SettingsGroup title={$t("admin.smtp")}>
        <label class="checkbox-label">
            <input
                id="enableSMTP"
                name="enableSMTP"
                class="checkbox"
                type="checkbox"
                bind:checked={config.smtp.enable}
            />
            <span>{$t("general.enable")}</span>
        </label>
        {#if config.smtp.enable}
            <div class="grid grid-cols-1 gap-x-4 gap-y-2 pb-1 md:grid-cols-2">
                <label for="smtpHost">
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
                <label for="smtpPort">
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
                <label for="smtpUser">
                    <span>{$t("general.user")}</span>
                    <input
                        id="smtpUser"
                        name="smtpUser"
                        class="input"
                        autocomplete="off"
                        required
                        type="text"
                        bind:value={config.smtp.user}
                    />
                </label>
                <PasswordInput
                    id="smtpPass"
                    name="smtpPass"
                    label={$t("auth.password")}
                    required
                    bind:value={config.smtp.pass}
                />
                <label for="smtpFrom">
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
                <label for="smtpFromName">
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
                    disabled={!saved || sending}
                    formaction="/admin/settings?/send-test"
                    type="submit"
                >
                    {#if sending}
                        <Progress class="w-6" value={null}>
                            <Progress.Circle>
                                <Progress.CircleTrack />
                                <Progress.CircleRange />
                            </Progress.Circle>
                        </Progress>
                    {:else}
                        {$t("admin.test-email")}
                    {/if}
                </button>
            </div>
        {/if}
    </SettingsGroup>
</div>
