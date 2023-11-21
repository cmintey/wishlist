<script lang="ts">
	import { enhance } from "$app/forms";
	import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
	import { getToastStore } from "@skeletonlabs/skeleton";
	import type { PageServerData } from "./$types";

	export let data: PageServerData;

	const toastStore = getToastStore();
</script>

{#if data?.item}
	<form
		method="POST"
		use:enhance={() => {
			// loading = true;
			return async ({ update }) => {
				const t = {
					message: "Item updated successfully",
					autohide: true,
					timeout: 5000
				};
				toastStore.trigger(t);
				update();
			};
		}}
	>
		<ItemForm buttonText="Save" data={data?.item} />
	</form>
{/if}

<svelte:head>
	<title>Edit Wish</title>
</svelte:head>
