<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        passwordStrength: number;
        disablePasswordLogin: boolean;
    }
    import { strengthOptions } from "$lib/zxcvbn";
    import Tooltip from "$lib/components/Tooltip.svelte";

    let { passwordStrength = $bindable(), disablePasswordLogin }: Props = $props();
</script>

<BaseSetting title={$t("admin.security")}>
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

        <select id="passwordStrength" name="passwordStrength" class="select w-full" bind:value={passwordStrength}>
            {#each strengthOptions as label, idx}
                <option value={idx - 1}>{$t(label)}</option>
            {/each}
        </select>
    </label>
    <label class="unstyled flex flex-row items-center space-x-2">
        <input
            id="disablePasswordLogin"
            name="disablePasswordLogin"
            class="checkbox"
            type="checkbox"
            bind:checked={disablePasswordLogin}
        />
        <Tooltip>
            {#snippet label()}
                <span>{$t("admin.disable-password-login")}</span>
            {/snippet}
            {#snippet description()}
                <span>{$t("admin.disable-password-login-tooltip")}</span>
            {/snippet}
        </Tooltip>
    </label>
</BaseSetting>
