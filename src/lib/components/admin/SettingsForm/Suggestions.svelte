<script lang="ts">
    import { t } from "svelte-i18n";

    interface Props {
        enabled: boolean;
        method: SuggestionMethod;
    }

    let { enabled = $bindable(), method = $bindable() }: Props = $props();
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">{$t("admin.suggestions")}</h2>
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
        <label class="w-fit">
            <span>{$t("admin.suggestions-method")}</span>
            <select id="suggestionMethod" name="suggestionMethod" class="select" bind:value={method}>
                <option value="surprise">{$t("admin.suggestions-surprise-me")}</option>
                <option value="auto-approval">{$t("admin.suggestions-auto-approve")}</option>
                <option value="approval">{$t("admin.suggestions-approval-required")}</option>
            </select>
        </label>
    {/if}
</div>
