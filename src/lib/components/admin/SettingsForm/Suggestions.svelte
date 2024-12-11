<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        enabled: boolean;
        method: SuggestionMethod;
    }

    let { enabled = $bindable(), method = $bindable() }: Props = $props();
</script>

<BaseSetting title={$t("admin.suggestions")}>
    <label class="unstyled flex flex-row space-x-2">
        <input
            id="enableSuggestions"
            name="enableSuggestions"
            class="checkbox"
            type="checkbox"
            bind:checked={enabled}
        />
        <span>{$t("general.enable")}</span>
    </label>
    {#if enabled}
        <label class="flex flex-col" for="suggestionMethod">
            <span>{$t("admin.suggestions-method")}</span>
            <select id="suggestionMethod" name="suggestionMethod" class="select w-full" bind:value={method}>
                <option value="surprise">{$t("admin.suggestions-surprise-me")}</option>
                <option value="auto-approval">{$t("admin.suggestions-auto-approve")}</option>
                <option value="approval">{$t("admin.suggestions-approval-required")}</option>
            </select>
        </label>
    {/if}
</BaseSetting>
