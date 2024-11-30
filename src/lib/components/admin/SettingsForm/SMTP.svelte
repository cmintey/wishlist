<script lang="ts">
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        enabled: boolean;
        host: string | undefined | null;
        port: number | undefined | null;
        user: string | undefined | null;
        pass: string | undefined | null;
        from: string | undefined | null;
        fromName: string | undefined | null;
    }

    let {
        enabled = $bindable(),
        host = $bindable(),
        port = $bindable(),
        user = $bindable(),
        pass = $bindable(),
        from = $bindable(),
        fromName = $bindable()
    }: Props = $props();
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">{$t("admin.smtp")}</h2>
    <label class="unstyled flex flex-row space-x-2">
        <input id="enableSMTP" name="enableSMTP" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>{$t("general.enable")}</span>
    </label>
    {#if enabled}
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
            <label for="smtpHost">
                <span>{$t("admin.smtp-host")}</span>
                <input
                    id="smtpHost"
                    name="smtpHost"
                    class="input"
                    autocomplete="off"
                    required
                    type="text"
                    bind:value={host}
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
                    bind:value={port}
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
                    bind:value={user}
                />
            </label>
            <PasswordInput id="smtpPass" name="smtpPass" label="Password" required bind:value={pass} />
            <label for="smtpFrom">
                <span>{$t("admin.smtp-from-email")}</span>
                <input
                    id="smtpFrom"
                    name="smtpFrom"
                    class="input"
                    autocomplete="off"
                    required
                    type="text"
                    bind:value={from}
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
                    bind:value={fromName}
                />
            </label>
        </div>
    {/if}
</div>
