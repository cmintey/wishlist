<script lang="ts">
    import { page } from "$app/stores";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import PublicSignup from "./PublicSignup.svelte";
    import Suggestions from "./Suggestions.svelte";
    import Smtp from "./SMTP.svelte";
    import Claims from "./Claims.svelte";

    export let config: Config;
    export let hideActions = false;
    export let saved = false;
    export let sending = false;
    export let sent = false;

    $: form = $page.form;
</script>

<!-- TODO: Add tooltips explaining the various settings -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div class="col-span-1">
        <PublicSignup bind:enabled={config.enableSignup} />
    </div>
    <div class="col-span-1">
        <Suggestions bind:enabled={config.suggestions.enable} bind:method={config.suggestions.method} />
    </div>
    <div class="col-span-1">
        <Claims bind:enabled={config.claims.showName} />
    </div>

    <div class="col-span-1 md:col-span-3">
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
                <iconify-icon icon="ion:checkmark" />
                <p>Save</p>
            {:else}
                Save
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
                    <iconify-icon icon="ion:checkmark" />
                    <p>Sent</p>
                {:else}
                    Test Email
                {/if}
            </button>
        {/if}
    </div>
{/if}
