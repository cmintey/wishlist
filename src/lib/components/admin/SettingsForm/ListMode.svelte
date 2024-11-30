<script lang="ts">
    import Alert from "$lib/components/Alert.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        mode: ListMode;
        disabled?: boolean;
    }

    let { mode = $bindable(), disabled = false }: Props = $props();
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">{$t("admin.wishlist-mode")}</h2>
    {#if disabled}
        <Alert type="info">{$t("admin.wishlist-mode-alert")}</Alert>
    {/if}
    <select id="listMode" name="listMode" class="select w-fit min-w-64" bind:value={mode}>
        <option value="standard">Wishlist</option>
        {#if !disabled}
            <option value="registry">{$t("admin.wishlist-mode-registry")}</option>
        {/if}
    </select>
</div>
