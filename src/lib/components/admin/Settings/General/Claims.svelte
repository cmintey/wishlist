<script lang="ts">
    import SettingsGroup from "../SettingsGroup.svelte";
    import Setting from "../Setting.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<Config, "claims">;
    }

    const props: Props = $props();
    const t = getFormatter();

    let config = $state(props.config);
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
    <Setting class={[!config.claims.showName && "hidden"]}>
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
    <Setting class={[!config.claims.showName && "hidden"]}>
        <label class="checkbox-label">
            <input
                id="claimsShowNamePublic"
                name="claimsShowNamePublic"
                class="checkbox"
                checked={config.claims.showNamePublic}
                type="checkbox"
            />
            <span>{$t("admin.show-name-publicly")}</span>
        </label>

        {#snippet description()}
            {$t("admin.show-name-publicly-tooltip")}
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
