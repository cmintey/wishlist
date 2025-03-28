<script lang="ts">
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import BaseSetting from "./BaseSetting.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        enabled: boolean;
        discoveryUrl: string | undefined | null;
        clientId: string | undefined | null;
        clientSecret: string | undefined | null;
        providerName: string | undefined | null;
        autoRedirect: boolean | undefined | null;
        autoRegister: boolean | undefined | null;
    }

    let {
        enabled = $bindable(),
        discoveryUrl = $bindable(),
        clientId = $bindable(),
        clientSecret = $bindable(),
        providerName = $bindable(),
        autoRedirect = $bindable(),
        autoRegister = $bindable()
    }: Props = $props();
</script>

<BaseSetting title={$t("admin.oidc")}>
    <label class="unstyled flex flex-row space-x-2">
        <input id="enableOIDC" name="enableOIDC" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>{$t("general.enable")}</span>
    </label>
    {#if enabled}
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
            <label for="oidcDiscoveryUrl">
                <span>{$t("admin.oidc-url")}</span>
                <input
                    id="oidcDiscoveryUrl"
                    name="oidcDiscoveryUrl"
                    class="input"
                    autocomplete="off"
                    required
                    type="url"
                    bind:value={discoveryUrl}
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
                    bind:value={clientId}
                />
            </label>
            <PasswordInput
                id="oidcClientSecret"
                name="oidcClientSecret"
                label={$t("admin.oidc-client-secret")}
                required
                bind:value={clientSecret}
            />
            <label for="oidcProviderName">
                <span>{$t("admin.oidc-provider-name")}</span>
                <input
                    id="oidcProviderName"
                    name="oidcProviderName"
                    class="input"
                    autocomplete="off"
                    placeholder="OAuth"
                    type="text"
                    bind:value={providerName}
                />
            </label>
            <label class="unstyled flex flex-row space-x-2">
                <input
                    id="oidcAutoRedirect"
                    name="oidcAutoRedirect"
                    class="checkbox"
                    type="checkbox"
                    bind:checked={autoRedirect}
                />
                <Tooltip>
                    {#snippet label()}
                        <span>{$t("admin.oidc-auto-redirect")}</span>
                    {/snippet}
                    {#snippet description()}
                        <span>
                            When enabled, the login page will automatically redirect to your Identity Provider's sign in
                            page. To bypass this, the '?direct=1' can be added to the URL.
                        </span>
                    {/snippet}
                </Tooltip>
            </label>
            <label class="unstyled flex flex-row space-x-2">
                <input
                    id="oidcAutoRegister"
                    name="oidcAutoRegister"
                    class="checkbox"
                    type="checkbox"
                    bind:checked={autoRegister}
                />
                <span>{$t("admin.oidc-auto-register")}</span>
            </label>
        </div>
    {/if}
</BaseSetting>
