<script lang="ts">
    import SettingsGroup from "../SettingsGroup.svelte";
    import Setting from "../Setting.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<Config, "claims">;
    }

    const { config }: Props = $props();
    const t = getFormatter();
</script>

<SettingsGroup title={$t("admin.claims")}>
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
    <Setting>
        <label class="checkbox-label">
            <input
                id="claimsRequireEmail"
                name="claimsRequireEmail"
                class="checkbox"
                type="checkbox"
                bind:checked={config.claims.requireEmail}
            />
            <span>{$t("admin.claims-require-email")}</span>
        </label>

        {#snippet description()}
            {$t("admin.claims-require-email-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
