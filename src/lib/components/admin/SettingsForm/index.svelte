<script lang="ts">
    import { page } from "$app/stores";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import PublicSignup from "./PublicSignup.svelte";
    import Suggestions from "./Suggestions.svelte";
    import Claims from "./Claims.svelte";
    import Security from "./Security.svelte";
    import DefaultGroup from "./DefaultGroup.svelte";
    import Smtp from "./SMTP.svelte";
    import { t } from "svelte-i18n";
    import Oidc from "./OIDC.svelte";

    type Group = {
        id: string;
        name: string;
    };

    interface Props {
        config: Config;
        groups: Group[];
        hideActions?: boolean;
        saved?: boolean;
        sending?: boolean;
        sent?: boolean;
    }

    let {
        config = $bindable(),
        groups = [],
        hideActions = false,
        saved = false,
        sending = false,
        sent = false
    }: Props = $props();

    let form = $derived($page.form);
</script>

<!-- TODO: Add tooltips explaining the various settings -->
<div class="grid grid-cols-1 gap-4 gap-y-8 md:grid-cols-2">
    <div class="col-span-1">
        <PublicSignup bind:enabled={config.enableSignup} />
    </div>
    <div class="col-span-1">
        <Suggestions bind:enabled={config.suggestions.enable} bind:method={config.suggestions.method} />
    </div>
    <div class="col-span-1">
        <Claims bind:enabled={config.claims.showName} />
    </div>
    <div class="col-span-1">
        <Security bind:passwordStrength={config.security.passwordStrength} />
    </div>
    <div class="col-span-1">
        <DefaultGroup {groups} bind:groupId={config.defaultGroup} />
    </div>

    <div class="col-span-1 md:col-span-2">
        <Smtp
            bind:enabled={config.smtp.enable}
            bind:host={config.smtp.host}
            bind:port={config.smtp.port}
            bind:user={config.smtp.user}
            bind:pass={config.smtp.pass}
            bind:from={config.smtp.from}
            bind:fromName={config.smtp.fromName}
        />
    </div>

    <div class="col-span-1 md:col-span-2">
        <Oidc
            bind:enabled={config.oidc.enable}
            bind:discoveryUrl={config.oidc.discoveryUrl}
            bind:clientId={config.oidc.clientId}
            bind:clientSecret={config.oidc.clientSecret}
            bind:providerName={config.oidc.providerName}
            bind:autoRedirect={config.oidc.autoRedirect}
            bind:autoRegister={config.oidc.autoRegister}
        />
    </div>
</div>

{#if form?.error && form?.errors}
    <ul>
        {#each form.errors as error}
            <li class="text-xs text-red-500">{error.message}</li>
        {/each}
    </ul>
{/if}

{#if !hideActions}
    <div class="mt-2 flex items-end space-x-4">
        <button class="variant-filled-primary btn mt-2" type="submit">
            {#if saved}
                <iconify-icon icon="ion:checkmark"></iconify-icon>
                <p>{$t("general.save")}</p>
            {:else}
                {$t("general.save")}
            {/if}
        </button>
        {#if saved && config.smtp.enable}
            <button
                class="variant-ghost-primary btn mt-2 h-min w-fit"
                disabled={sending || sent}
                formaction="/admin/settings?/send-test"
                type="submit"
            >
                {#if sending}
                    <ProgressRadial stroke={64} width="w-6" />
                {:else if sent}
                    <iconify-icon icon="ion:checkmark"></iconify-icon>
                    <p>Sent</p>
                {:else}
                    Test Email
                {/if}
            </button>
        {/if}
    </div>
{/if}
