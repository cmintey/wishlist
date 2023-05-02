<script lang="ts">
	export let enabled: boolean;
	export let method: SuggestionMethod;
</script>

<div class="flex flex-col space-y-2">
	<h2>Suggestions</h2>
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
		<label class="w-fit">
			<span>Method</span>
			<select id="suggestionMethod" name="suggestionMethod" class="select" bind:value={method}>
				<option value="surprise">Surprise Me</option>
				<option value="auto-approval">Auto-Approve</option>
				<option value="approval">Approval Required</option>
			</select>
		</label>
	{/if}
</div>
