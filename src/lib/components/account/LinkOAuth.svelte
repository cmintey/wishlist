<script lang="ts">
    import { enhance } from "$app/forms";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        providerName?: string | null;
        oauthId?: string | null;
    }

    const { providerName: providerName_, oauthId }: Props = $props();
    const t = getFormatter();

    const providerName = $derived(providerName_ || $t("general.oauth"));
</script>

<div class="flex flex-col gap-4">
    <h3 class="h3">{$t("general.oauth")}</h3>

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
