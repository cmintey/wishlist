<script lang="ts">
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { strengthOptions } from "$lib/zxcvbn";
    import { t } from "svelte-i18n";
    import Setting from "../Setting.svelte";
    import SettingsGroup from "../SettingsGroup.svelte";

    interface Props {
        config: Pick<Config, "security" | "enableSignup">;
    }

    const { config }: Props = $props();
</script>

<SettingsGroup>
    <h3 class="h3">{$t("admin.credentials")}</h3>
    <Setting>
        <label class="checkbox-label">
            <input
                id="enableSignup"
                name="enableSignup"
                class="checkbox"
                type="checkbox"
                bind:checked={config.enableSignup}
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
                    <iconify-icon class="text-warning-700" icon="ion:warning-outline"></iconify-icon>
                {/snippet}
            </Tooltip>

            <select
                id="passwordStrength"
                name="passwordStrength"
                class="select w-fit min-w-64"
                bind:value={config.security.passwordStrength}
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
                type="checkbox"
                bind:checked={config.security.disablePasswordLogin}
            />
            <span>{$t("admin.disable-password-login")}</span>
        </label>
        {#snippet description()}
            {$t("admin.disable-password-login-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
