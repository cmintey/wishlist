<script lang="ts">
    import { enhance } from "$app/forms";
    import { t } from "svelte-i18n";

    interface Props {
        providerName?: string | null;
        oauthId?: string | null;
    }

    const { providerName = "OAuth", oauthId }: Props = $props();
</script>

<div class="flex flex-col gap-4">
    <h3 class="h3">OAuth</h3>

    {#if oauthId}
        <form class="flex flex-col gap-4" action="?/unlinkoauth" method="POST" use:enhance>
            <span>{$t("auth.your-account-is-currently-linked-with-oauth", { values: { providerName } })}</span>
            <button class="variant-filled-primary btn w-fit">
                {$t("auth.unlink-oauth", { values: { providerName } })}
            </button>
        </form>
    {:else}
        <span>
            {$t("auth.account-is-not-linked-with-oauth", { values: { providerName } })}
        </span>
    {/if}
</div>
