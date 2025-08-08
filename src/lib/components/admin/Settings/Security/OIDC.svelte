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
</script>

<SettingsGroup title={$t("admin.oidc")}>
    <label class="checkbox-label">
        <input id="enableOIDC" name="enableOIDC" class="checkbox" type="checkbox" bind:checked={config.oidc.enable} />
        <span>{$t("general.enable")}</span>
    </label>
    {#if config.oidc.enable}
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 pb-1 md:grid-cols-2">
            <label for="oidcDiscoveryUrl">
                <span>{$t("admin.oidc-url")}</span>
                <input
                    id="oidcDiscoveryUrl"
                    name="oidcDiscoveryUrl"
                    class="input"
                    autocomplete="off"
                    required
                    type="url"
                    bind:value={config.oidc.discoveryUrl}
                />
            </label>
            <label for="oidcProviderName">
                <span>{$t("admin.oidc-provider-name")}</span>
                <input
                    id="oidcProviderName"
                    name="oidcProviderName"
                    class="input"
                    autocomplete="off"
                    placeholder="OAuth"
                    type="text"
                    bind:value={config.oidc.providerName}
                />
            </label>
            <label for="oidcClientId">
                <span>{$t("admin.oidc-client-id")}</span>
                <input
                    id="oidcClientId"
                    name="oidcClientId"
                    class="input"
                    autocomplete="off"
                    required
                    type="text"
                    bind:value={config.oidc.clientId}
                />
            </label>
            <PasswordInput
                id="oidcClientSecret"
                name="oidcClientSecret"
                autocomplete="off"
                label={$t("admin.oidc-client-secret")}
                required
                bind:value={config.oidc.clientSecret}
            />

            <Setting>
                <label class="checkbox-label">
                    <input
                        id="oidcAutoRedirect"
                        name="oidcAutoRedirect"
                        class="checkbox"
                        type="checkbox"
                        bind:checked={config.oidc.autoRedirect}
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
            </Setting>

            <label class="checkbox-label">
                <input
                    id="oidcAutoRegister"
                    name="oidcAutoRegister"
                    class="checkbox"
                    type="checkbox"
                    bind:checked={config.oidc.autoRegister}
                />
                <Tooltip>
                    {#snippet label()}
                        <span>{$t("admin.oidc-auto-register")}</span>
                    {/snippet}
                    {#snippet description()}
                        <span>{$t("admin.oidc-auto-register-tooltip")}</span>
                    {/snippet}
                </Tooltip>
            </label>
        </div>
    {/if}
</SettingsGroup>
