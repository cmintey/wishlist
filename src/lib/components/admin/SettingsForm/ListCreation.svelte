<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        enabled: boolean;
    }

    let { enabled = $bindable() }: Props = $props();
</script>

<BaseSetting title={$t("admin.list-creation")}>
    <span>{$t("admin.enable-default-list-creation-tooltip")}</span>
    <label class="unstyled flex flex-row space-x-2">
        <input
            id="enableDefaultListCreation"
            name="enableDefaultListCreation"
            class="checkbox"
            type="checkbox"
            bind:checked={enabled}
        />
        <span>{$t("admin.enable-default-list-creation")}</span>
    </label>
</BaseSetting>
