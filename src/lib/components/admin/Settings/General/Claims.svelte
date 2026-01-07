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
                checked={config.claims.showName}
                type="checkbox"
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
                id="claimsShowNameAcrossGroups"
                name="claimsShowNameAcrossGroups"
                class="checkbox"
                checked={config.claims.showNameAcrossGroups}
                type="checkbox"
            />
            <span>{$t("admin.show-name-across-groups")}</span>
        </label>

        {#snippet description()}
            {$t("admin.show-name-across-groups-tooltip")}
        {/snippet}
    </Setting>
    <Setting>
        <label class="checkbox-label">
            <input
                id="claimsShowForOwner"
                name="claimsShowForOwner"
                class="checkbox"
                checked={config.claims.showForOwner}
                type="checkbox"
            />
            <span>{$t("admin.show-for-list-owner")}</span>
        </label>

        {#snippet description()}
            {$t("admin.show-for-list-owner-description")}
        {/snippet}
    </Setting>
    <Setting>
        <label class="checkbox-label">
            <input
                id="claimsRequireEmail"
                name="claimsRequireEmail"
                class="checkbox"
                checked={config.claims.requireEmail}
                type="checkbox"
            />
            <span>{$t("admin.claims-require-email")}</span>
        </label>

        {#snippet description()}
            {$t("admin.claims-require-email-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
