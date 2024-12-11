<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        passwordStrength: number;
    }
    import { strengthOptions } from "$lib/zxcvbn";

    let { passwordStrength = $bindable() }: Props = $props();
</script>

<BaseSetting title={$t("admin.security")}>
    <label class="flex flex-col" for="passwordStrength">
        <span>{$t("admin.password-strength-requirement")}</span>
        <select id="passwordStrength" name="passwordStrength" class="select w-full" bind:value={passwordStrength}>
            {#each strengthOptions as label, idx}
                <option value={idx - 1}>{$t(label)}</option>
            {/each}
        </select>
        <div class="flex flex-row items-center space-x-2">
            <iconify-icon icon="ion:information-circle-outline"></iconify-icon>
            <span class="font-bold">
                {$t("admin.password-strength-warning")}
            </span>
        </div>
    </label>
</BaseSetting>
