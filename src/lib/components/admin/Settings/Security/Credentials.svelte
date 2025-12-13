<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { getFormatter } from "$lib/i18n";
    import { strengthOptions } from "$lib/zxcvbn";
    import Setting from "../Setting.svelte";
    import SettingsGroup from "../SettingsGroup.svelte";

    interface Props {
        config: Pick<Config, "security" | "enableSignup">;
    }

    const { config }: Props = $props();
    const t = getFormatter();
</script>

<SettingsGroup title={$t("admin.credentials")}>
    <Setting>
        <label class="checkbox-label">
            <input
                id="enableSignup"
                name="enableSignup"
                class="checkbox"
                checked={config.enableSignup}
                type="checkbox"
            />
            <span>{$t("admin.enable-signup")}</span>
        </label>
    </Setting>

    <Setting>
        <label class="flex flex-col" for="passwordStrength">
            <Tooltip>
                {#snippet label()}
                    <span>{$t("admin.password-strength-requirement")}</span>
                {/snippet}
                {#snippet description()}
                    <span>{$t("admin.password-strength-warning")}</span>
                {/snippet}
                {#snippet icon()}
                    <Icon class="text-warning-700" icon="ion--warning-outline"></Icon>
                {/snippet}
            </Tooltip>

            <select
                id="passwordStrength"
                name="passwordStrength"
                class="select w-fit min-w-64"
                value={config.security.passwordStrength}
            >
                {#each strengthOptions as label, idx}
                    <option value={idx - 1}>{$t(label)}</option>
                {/each}
            </select>
        </label>
        {#snippet description()}
            {$t("admin.password-strength-requirement-tooltip")}
        {/snippet}
    </Setting>

    <Setting>
        <label class="checkbox-label">
            <input
                id="disablePasswordLogin"
                name="disablePasswordLogin"
                class="checkbox"
                checked={config.security.disablePasswordLogin}
                type="checkbox"
            />
            <span>{$t("admin.disable-password-login")}</span>
        </label>
        {#snippet description()}
            {$t("admin.disable-password-login-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
