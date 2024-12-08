<script lang="ts">
    import { enhance } from "$app/forms";
    import Claims from "$lib/components/admin/SettingsForm/Claims.svelte";
    import ListMode from "$lib/components/admin/SettingsForm/ListMode.svelte";
    import Suggestions from "$lib/components/admin/SettingsForm/Suggestions.svelte";
    import type { PageData } from "./$types";
    import { t } from "svelte-i18n";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    let config = $state(data.config);
    let saved = $state(false);
</script>

<form
    method="POST"
    use:enhance={() => {
        return ({ result }) => {
            if (result.type === "success") {
                saved = true;
            }
        };
    }}
>
    <div class="grid grid-cols-1 gap-4 pb-2 md:grid-cols-2">
        <div class="col-span-1">
            <ListMode disabled={data.membershipCount > 1} bind:mode={config.listMode} />
        </div>
        <div class="col-span-1">
            <Suggestions bind:enabled={config.suggestions.enable} bind:method={config.suggestions.method} />
        </div>
        <div class="col-span-1">
            <Claims bind:enabled={config.claims.showName} />
        </div>
    </div>

    <button class="variant-filled-primary btn mt-2" type="submit">
        {#if saved}
            <iconify-icon icon="ion:checkmark"></iconify-icon>
            <p>{$t("general.saved")}</p>
        {:else}
            {$t("general.save")}
        {/if}
    </button>
</form>
