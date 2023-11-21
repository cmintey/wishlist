<script lang="ts">
	import { enhance } from "$app/forms";
	import Suggestions from "$lib/components/admin/SettingsForm/Suggestions.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;

	let saved = false;
</script>

<form
	method="POST"
	use:enhance={() => {
		return ({ result }) => {
			if (result.type === "success") {
				saved = true;
			}
		};
	}}
>
	<Suggestions
		bind:enabled={data.config.suggestions.enable}
		bind:method={data.config.suggestions.method}
	/>

	<button class="variant-filled-primary btn mt-2" type="submit">
		{#if saved}
			<iconify-icon icon="ion:checkmark" />
			<p>Saved</p>
		{:else}
			Save
		{/if}
	</button>
</form>
