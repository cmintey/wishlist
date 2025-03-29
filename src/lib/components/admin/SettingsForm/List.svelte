<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        creationEnabled: boolean;
        allowPublic: boolean;
        listMode: ListMode;
    }

    let { creationEnabled = $bindable(), allowPublic = $bindable(), listMode }: Props = $props();
</script>

<BaseSetting title={$t("admin.list-creation")}>
    <span>{$t("admin.enable-default-list-creation-tooltip")}</span>
    <label class="unstyled flex flex-row items-center space-x-2">
        <input
            id="enableDefaultListCreation"
            name="enableDefaultListCreation"
            class="checkbox"
            type="checkbox"
            bind:checked={creationEnabled}
        />
        <span>{$t("admin.enable-default-list-creation")}</span>
    </label>

    <span>{$t("admin.allow-public-lists-tooltip")}</span>
    <label class="unstyled flex flex-row items-center space-x-2">
        <input
            id="allowPublicLists"
            name="allowPublicLists"
            class="checkbox"
            class:disabled={listMode === "registry"}
            checked={allowPublic || listMode === "registry"}
            disabled={listMode === "registry"}
            onchange={(e) => (allowPublic = e.currentTarget.checked)}
            type="checkbox"
        />
        <span>{$t("admin.allow-public-lists")}</span>
    </label>
</BaseSetting>
