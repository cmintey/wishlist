<script lang="ts">
    import { t } from "svelte-i18n";
    import SettingsGroup from "../SettingsGroup.svelte";
    import Setting from "../Setting.svelte";

    interface Props {
        config: Pick<Config, "enableDefaultListCreation" | "allowPublicLists" | "listMode">;
    }

    const { config }: Props = $props();
</script>

<SettingsGroup>
    <h3 class="h3">{$t("wishes.lists")}</h3>
    <Setting>
        <label class="checkbox-label">
            <input
                id="enableDefaultListCreation"
                name="enableDefaultListCreation"
                class="checkbox"
                type="checkbox"
                bind:checked={config.enableDefaultListCreation}
            />
            <span>{$t("admin.enable-default-list-creation")}</span>
        </label>

        {#snippet description()}
            {$t("admin.enable-default-list-creation-tooltip")}
        {/snippet}
    </Setting>

    <Setting>
        <label class="checkbox-label">
            <input
                id="allowPublicLists"
                name="allowPublicLists"
                class="checkbox"
                class:disabled={config.listMode === "registry"}
                checked={config.allowPublicLists || config.listMode === "registry"}
                disabled={config.listMode === "registry"}
                onchange={(e) => (config.allowPublicLists = e.currentTarget.checked)}
                type="checkbox"
            />
            <span>{$t("admin.allow-public-lists")}</span>
        </label>

        {#snippet description()}
            {$t("admin.allow-public-lists-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
