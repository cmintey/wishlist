<script lang="ts">
    import { t } from "svelte-i18n";

    interface Props {
        enabled: boolean;
    }

    let { enabled = $bindable() }: Props = $props();
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">{$t("admin.public-signup")}</h2>
    <label class="unstyled flex flex-row space-x-2">
        <input id="enableSignup" name="enableSignup" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>{$t("general.enable")}</span>
    </label>
</div>
