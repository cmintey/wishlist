<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { ProgressRadial } from "@skeletonlabs/skeleton";
	import PublicSignup from "./PublicSignup.svelte";
	import Suggestions from "./Suggestions.svelte";
	import Smtp from "./SMTP.svelte";

	// eslint-disable-next-line no-undef
	export let config: Config;
	const form = $page.form;

	$: saved = config ? false : false;
	let sending = false;
	let sent = false;
</script>

<!-- TODO: Add tooltips explaining the various settings -->
<form
	method="POST"
	action="?/settings"
	use:enhance={({ action }) => {
		if (action.search === "?/send-test") {
			sending = true;
		}
		return ({ action, result }) => {
			if (action.search === "?/settings" && result.type === "success") {
				saved = true;
			}
			if (action.search === "?/send-test" && result.type === "success") {
				sending = false;
				sent = true;
			}
		};
	}}
>
	<div class="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
		<PublicSignup bind:enabled={config.enableSignup} />
		<Suggestions bind:enabled={config.suggestions.enable} bind:method={config.suggestions.method} />
	</div>
	<Smtp
		bind:enabled={config.smtp.enable}
		bind:host={config.smtp.host}
		bind:port={config.smtp.port}
		bind:user={config.smtp.user}
		bind:pass={config.smtp.pass}
		bind:from={config.smtp.from}
		bind:fromName={config.smtp.fromName}
	/>

	{#if form?.error && form?.errors}
		<ul>
			{#each form.errors as error}
				<li class="text-xs text-red-500">{error.message}</li>
			{/each}
		</ul>
	{/if}

	<div class="flex space-x-4 mt-2 items-end">
		<button class="btn variant-filled-primary mt-2" type="submit">
			{#if saved}
				<iconify-icon icon="ri:check-line" />
				<p>Saved</p>
			{:else}
				Save
			{/if}
		</button>
		{#if saved && config.smtp.enable}
			<button
				class="btn variant-ghost-primary mt-2 w-fit h-min"
				type="submit"
				formaction="?/send-test"
				disabled={sending || sent}
			>
				{#if sending}
					<span class="h-6 w-6">
						<ProgressRadial stroke={64} />
					</span>
				{:else if sent}
					<iconify-icon icon="ri:check-line" />
					<p>Sent</p>
				{:else}
					Test Email
				{/if}
			</button>
		{/if}
	</div>
</form>
