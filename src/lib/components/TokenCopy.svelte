<script lang="ts">
	import { clipboard, tooltip } from "@skeletonlabs/skeleton";
	import { fade } from "svelte/transition";

	export let url: string;

	let copiedVisible = false;
</script>

<div class="flex flex-row items-center w-100">
	<span class="text-ellipsis">
		<a href={url}>
			<!-- Svelte slot -->
			<slot />
		</a>
		<span hidden data-clipboard="tokenUrl">{url}</span>
	</span>
	<div class="flex flex-row items-center">
		<button
			class="btn btn-icon"
			type="button"
			use:clipboard={{ element: "tokenUrl" }}
			use:tooltip={{ content: "Copy to clipboard" }}
			on:click={() => {
				copiedVisible = true;
				setTimeout(() => (copiedVisible = false), 1000);
			}}
		>
			<iconify-icon icon="ion:copy" />
		</button>
		{#if copiedVisible}
			<span out:fade>Copied!</span>
		{/if}
	</div>
</div>
