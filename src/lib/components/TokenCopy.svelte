<script lang="ts">
	import { clipboard, popup, type PopupSettings } from "@skeletonlabs/skeleton";
	import { fade } from "svelte/transition";

	export let url: string;

	let copiedVisible = false;

	const tooltipSettings: PopupSettings = {
		event: "hover",
		target: "copy"
	};
</script>

<div class="flex flex-row items-center w-100">
	<span class="text-ellipsis">
		<a href={url}>
			<slot />
		</a>
		<span hidden data-clipboard="tokenUrl">{url}</span>
	</span>
	<div class="flex flex-row items-center">
		<button
			class="btn btn-icon"
			type="button"
			use:clipboard={{ element: "tokenUrl" }}
			use:popup={tooltipSettings}
			on:click={() => {
				copiedVisible = true;
				setTimeout(() => (copiedVisible = false), 1000);
			}}
		>
			<iconify-icon icon="ion:copy" />
		</button>
		<div class="card variant-filled-secondary p-2" data-popup="copy">
			Copy to clipboard
			<div class="arrow variant-filled-secondary" />
		</div>
		{#if copiedVisible}
			<span out:fade>Copied!</span>
		{/if}
	</div>
</div>
