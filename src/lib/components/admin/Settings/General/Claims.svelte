<script lang="ts">
    import { t } from "svelte-i18n";
    import SettingsGroup from "../SettingsGroup.svelte";
    import Setting from "../Setting.svelte";

    interface Props {
        config: Pick<Config, "claims">;
    }

    const { config }: Props = $props();
</script>

<SettingsGroup>
    <h3 class="h3">{$t("admin.claims")}</h3>
    <Setting>
        <label class="checkbox-label">
            <input
                id="claimsShowName"
                name="claimsShowName"
                class="checkbox"
                type="checkbox"
                bind:checked={config.claims.showName}
            />
            <span>{$t("admin.show-name")}</span>
        </label>

        {#snippet description()}
            {$t("admin.claims-name-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
