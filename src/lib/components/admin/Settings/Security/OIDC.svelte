<script lang="ts">
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { getFormatter } from "$lib/i18n";
    import Setting from "../Setting.svelte";
    import SettingsGroup from "../SettingsGroup.svelte";

    interface Props {
        config: Pick<Config, "oidc">;
    }

    const { config }: Props = $props();
    const t = getFormatter();

    let enabled = $state(config.oidc.enable);
</script>

<SettingsGroup title={$t("admin.oidc")}>
    <label class="checkbox-label">
        <input id="enableOIDC" name="enableOIDC" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>{$t("general.enable")}</span>
    </label>
    {#if enabled}
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 pb-1 md:grid-cols-2">
            <label class="label" for="oidcDiscoveryUrl">
                <span>{$t("admin.oidc-url")}</span>
                <input
                    id="oidcDiscoveryUrl"
                    name="oidcDiscoveryUrl"
                    class="input"
                    autocomplete="off"
                    required
                    type="url"
                    value={config.oidc.discoveryUrl}
                />
            </label>
            <label class="label" for="oidcProviderName">
                <span>{$t("admin.oidc-provider-name")}</span>
                <input
                    id="oidcProviderName"
                    name="oidcProviderName"
                    class="input"
                    autocomplete="off"
                    placeholder="OAuth"
                    type="text"
                    value={config.oidc.providerName}
                />
            </label>
            <label class="label" for="oidcClientId">
                <span>{$t("admin.oidc-client-id")}</span>
                <input
                    id="oidcClientId"
                    name="oidcClientId"
                    class="input"
                    autocomplete="off"
                    required
                    type="text"
                    value={config.oidc.clientId}
                />
            </label>
            <PasswordInput
                id="oidcClientSecret"
                name="oidcClientSecret"
                autocomplete="off"
                label={$t("admin.oidc-client-secret")}
                required
                value={config.oidc.clientSecret}
            />

            <Setting class="col-span-full">
                <label class="checkbox-label">
                    <input
                        id="oidcAutoRedirect"
                        name="oidcAutoRedirect"
                        class="checkbox"
                        checked={config.oidc.autoRedirect}
                        type="checkbox"
                    />
                    <Tooltip>
                        {#snippet label()}
                            <span>{$t("admin.oidc-auto-redirect")}</span>
                        {/snippet}
                        {#snippet description()}
                            <span>{$t("admin.oidc-auto-redirect-tooltip")}</span>
                        {/snippet}
                    </Tooltip>
                </label>
                {#snippet description()}
                    <span>{$t("admin.oidc-auto-redirect-description")}</span>
                {/snippet}
            </Setting>

            <Setting class="col-span-full">
                <label class="checkbox-label col-span-full">
                    <input
                        id="oidcAutoRegister"
                        name="oidcAutoRegister"
                        class="checkbox"
                        checked={config.oidc.autoRegister}
                        type="checkbox"
                    />
                    <span>{$t("admin.oidc-auto-register")}</span>
                </label>
                {#snippet description()}
                    <span>{$t("admin.oidc-auto-register-tooltip")}</span>
                {/snippet}
            </Setting>

            <Setting class="col-span-full">
                <label class="checkbox-label">
                    <input
                        id="oidcEnableSync"
                        name="oidcEnableSync"
                        class="checkbox"
                        checked={config.oidc.enableSync}
                        type="checkbox"
                    />
                    <span>{$t("admin.enable-sync")}</span>
                </label>
                {#snippet description()}
                    <span>{$t("admin.enable-sync-description")}</span>
                {/snippet}
            </Setting>

            <Setting class="col-span-full">
                <label class="checkbox-label">
                    <input
                        id="oidcDisableEmailVerification"
                        name="oidcDisableEmailVerification"
                        class="checkbox"
                        checked={config.oidc.disableEmailVerification}
                        type="checkbox"
                    />
                    <span>{$t("admin.disable-email-verification")}</span>
                </label>
                {#snippet description()}
                    <span>
                        {$t("admin.disable-email-verification-description")}
                    </span>
                {/snippet}
            </Setting>
        </div>
    {/if}
</SettingsGroup>
