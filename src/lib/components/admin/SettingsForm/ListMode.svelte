<script lang="ts">
    import Alert from "$lib/components/Alert.svelte";
    import BaseSetting from "./BaseSetting.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        mode: ListMode;
        disabled?: boolean;
    }

    let { mode = $bindable(), disabled = false }: Props = $props();
</script>

<BaseSetting title={$t("admin.wishlist-mode")}>
    {#if disabled}
        <Alert type="info">{$t("admin.wishlist-mode-alert")}</Alert>
    {/if}
    <span>{$t("admin.wishlist-mode-display-text")}</span>
    <select id="listMode" name="listMode" class="select w-fit min-w-64" bind:value={mode}>
        <option value="standard">{$t("admin.wishlist-mode-wishlist")}</option>
        {#if !disabled}
            <option value="registry">{$t("admin.wishlist-mode-registry")}</option>
        {/if}
    </select>
</BaseSetting>
