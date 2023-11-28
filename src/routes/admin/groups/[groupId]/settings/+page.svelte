<script lang="ts">
	import { enhance } from "$app/forms";
	import Claims from "$lib/components/admin/SettingsForm/Claims.svelte";
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
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="col-span-1">
			<Suggestions
				bind:enabled={data.config.suggestions.enable}
				bind:method={data.config.suggestions.method}
			/>
		</div>
		<div class="col-span-1">
			<Claims bind:enabled={data.config.claims.showName} />
		</div>
	</div>

	<button class="variant-filled-primary btn mt-2" type="submit">
		{#if saved}
			<iconify-icon icon="ion:checkmark" />
			<p>Saved</p>
		{:else}
			Save
		{/if}
	</button>
</form>
