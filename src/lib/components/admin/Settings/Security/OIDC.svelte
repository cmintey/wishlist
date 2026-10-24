<script lang="ts">
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { getFormatter } from "$lib/i18n";
    import Setting from "../Setting.svelte";
    import SettingsGroup from "../SettingsGroup.svelte";

    interface Props {
        config: Pick<Config, "oidc">;
        envManagedKeys?: string[];
    }

    const { config, envManagedKeys = [] }: Props = $props();
    const t = getFormatter();

    const locked = (key: keyof OIDCConfig) => envManagedKeys.includes(`oidc.${key}`);
    const anyLocked = $derived(envManagedKeys.some((key) => key.startsWith("oidc.")));

    let enabled = $derived(config.oidc.enable);
</script>

<SettingsGroup title={$t("admin.oidc")}>
    {#if anyLocked}
        <span class="text-sm">{$t("admin.oidc-env-managed")}</span>
    {/if}
    <label class="checkbox-label">
        <input
            id="enableOIDC"
            name="enableOIDC"
            class="checkbox"
            disabled={locked("enable")}
            type="checkbox"
            bind:checked={enabled}
        />
        <span>{$t("general.enable")}</span>
    </label>
    {#if enabled}
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 pb-1 md:grid-cols-2">
            <label class="label" for="oidcDiscoveryUrl">
                <Tooltip>
                    {#snippet label()}
                        <span>{$t("admin.oidc-url")}</span>
                    {/snippet}
                    {#snippet description()}
                        <span>{$t("admin.oidc-url-description")}</span>
                    {/snippet}
                </Tooltip>

                <input
                    id="oidcDiscoveryUrl"
                    name="oidcDiscoveryUrl"
                    class="input"
                    autocomplete="off"
                    disabled={locked("discoveryUrl")}
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
                    disabled={locked("providerName")}
                    placeholder={$t("general.oauth")}
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
                    disabled={locked("clientId")}
                    required
                    type="text"
                    value={config.oidc.clientId}
                />
            </label>
            <PasswordInput
                id="oidcClientSecret"
                name="oidcClientSecret"
                autocomplete="off"
                disabled={locked("clientSecret")}
                label={$t("admin.oidc-client-secret")}
                required
                value={config.oidc.clientSecret}
            />

            <Setting>
                <label class="label" for="oidcNameClaim">
                    <span>Name claim</span>
                    <input
                        id="oidcNameClaim"
                        name="oidcNameClaim"
                        class="input"
                        autocomplete="off"
                        disabled={locked("nameClaim")}
                        placeholder="name"
                        type="text"
                        value={config.oidc.nameClaim}
                    />
                </label>
                {#snippet description()}
                    {$t("admin.oidc-claim-name-description")}
                {/snippet}
            </Setting>

            <Setting>
                <label class="label" for="oidcUsernameClaim">
                    <span>Username claim</span>
                    <input
                        id="oidcUsernameClaim"
                        name="oidcUsernameClaim"
                        class="input"
                        autocomplete="off"
                        disabled={locked("usernameClaim")}
                        placeholder="preferred_username"
                        type="text"
                        value={config.oidc.usernameClaim}
                    />
                </label>
                {#snippet description()}
                    {$t("admin.oidc-claim-username-description")}
                {/snippet}
            </Setting>

            <Setting>
                <label class="label" for="oidcGroupsClaim">
                    <span>{$t("admin.oidc-groups-claim")}</span>
                    <input
                        id="oidcGroupsClaim"
                        name="oidcGroupsClaim"
                        class="input"
                        autocomplete="off"
                        disabled={locked("groupsClaim")}
                        placeholder="groups"
                        type="text"
                        value={config.oidc.groupsClaim}
                    />
                </label>
                {#snippet description()}
                    {$t("admin.oidc-groups-claim-description")}
                {/snippet}
            </Setting>

            <Setting>
                <label class="label" for="oidcAdminGroup">
                    <span>{$t("admin.oidc-admin-group")}</span>
                    <input
                        id="oidcAdminGroup"
                        name="oidcAdminGroup"
                        class="input"
                        autocomplete="off"
                        disabled={locked("adminGroup")}
                        type="text"
                        value={config.oidc.adminGroup}
                    />
                </label>
                {#snippet description()}
                    {$t("admin.oidc-admin-group-description")}
                {/snippet}
            </Setting>

            <Setting class="col-span-full">
                <label class="checkbox-label">
                    <input
                        id="oidcAutoRedirect"
                        name="oidcAutoRedirect"
                        class="checkbox"
                        checked={config.oidc.autoRedirect}
                        disabled={locked("autoRedirect")}
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
                        disabled={locked("autoRegister")}
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
                        disabled={locked("enableSync")}
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
                        disabled={locked("disableEmailVerification")}
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
