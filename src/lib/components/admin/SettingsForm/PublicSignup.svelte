<script lang="ts">
	export let enabled: boolean;
</script>

<div class="flex flex-col space-y-2">
	<h2>Public Signup</h2>
	<label class="unstyled flex flex-row space-x-2">
		<input
			class="checkbox"
			type="checkbox"
			name="enableSignup"
			id="enableSignup"
			bind:checked={enabled}
		/>
		<span>Enable</span>
	</label>
</div>
