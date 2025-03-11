<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";

    import { t } from "svelte-i18n";

    interface Props {
        enabled: boolean;
    }

    let { enabled = $bindable() }: Props = $props();
</script>

<BaseSetting title={$t("admin.public-signup")}>
    <label class="unstyled flex flex-row items-center space-x-2">
        <input id="enableSignup" name="enableSignup" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>{$t("general.enable")}</span>
    </label>
</BaseSetting>
