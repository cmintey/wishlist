<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";

    interface Props {
        passwordStrength: number;
    }
    import { strengthOptions } from "$lib/zxcvbn";

    let { passwordStrength = $bindable() }: Props = $props();
</script>

<BaseSetting title="Security">
    <label class="flex flex-col" for="passwordStrength">
        <span>Password Strength Requirement</span>
        <select id="passwordStrength" name="passwordStrength" class="select w-full" bind:value={passwordStrength}>
            {#each strengthOptions as label, idx}
                <option value={idx - 1}>{label}</option>
            {/each}
        </select>
        <div class="flex flex-row items-center space-x-2">
            <iconify-icon icon="ion:information-circle-outline"></iconify-icon>
            <span class="font-bold">
                Use caution when changing or disabling this value! If disabled, any password of 1 character or more will
                be allowed.
            </span>
        </div>
    </label>
</BaseSetting>
