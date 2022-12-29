<script lang="ts">
	import { enhance } from "$app/forms";
	import ItemForm from "$lib/components/ItemForm.svelte";
	import { toastStore } from "@skeletonlabs/skeleton";
	import type { PageServerData, ActionData } from "./$types";

	export let data: PageServerData;
	export let form: ActionData;
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
		<ItemForm {form} data={data?.item} buttonText="Save" />
	</form>
{/if}
