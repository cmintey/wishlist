<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";

    interface Props {
        enabled: boolean;
        method: SuggestionMethod;
    }

    let { enabled = $bindable(), method = $bindable() }: Props = $props();
</script>

<BaseSetting title="Suggestions">
    <label class="unstyled flex flex-row space-x-2">
        <input
            id="enableSuggestions"
            name="enableSuggestions"
            class="checkbox"
            type="checkbox"
            bind:checked={enabled}
        />
        <span>Enable</span>
    </label>
    {#if enabled}
        <label class="flex flex-col" for="suggestionMethod">
            <span>Method</span>
            <select id="suggestionMethod" name="suggestionMethod" class="select w-full" bind:value={method}>
                <option value="surprise">Surprise Me</option>
                <option value="auto-approval">Auto-Approve</option>
                <option value="approval">Approval Required</option>
            </select>
        </label>
    {/if}
</BaseSetting>
