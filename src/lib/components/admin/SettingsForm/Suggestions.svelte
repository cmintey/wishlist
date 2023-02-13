<script lang="ts">
	export let enabled: boolean;
	// eslint-disable-next-line no-undef
	export let method: SuggestionMethod;
</script>

<div class="flex flex-col space-y-2">
	<h3>Suggestions</h3>
	<label class="unstyled flex flex-row space-x-2">
		<input
			class="checkbox"
			type="checkbox"
			name="enableSuggestions"
			id="enableSuggestions"
			bind:checked={enabled}
		/>
		<span>Enable</span>
	</label>
	{#if enabled}
		<label class="w-fit">
			<span>Method</span>
			<select class="select" name="suggestionMethod" id="suggestionMethod" bind:value={method}>
				<option value="surprise">Surprise Me</option>
				<option value="auto-approval">Auto-Approve</option>
				<option value="approval">Approval Required</option>
			</select>
		</label>
	{/if}
</div>
