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
		<!-- <div class="grid gap-4 grid-cols-1 md:grid-cols-3">
			<label for="url" class="col-span-1 md:col-span-3">
				<span>Item URL</span>
				<input
					type="url"
					id="url"
					name="url"
					bind:value={data.item.url}
					placeholder="https://www.amazon.com/Litfun-Womens-Memory-Slippers-Outdoor/dp/B09JVQ84VG"
				/>
			</label>

			<label for="name" class="col-span-1 md:col-span-2 row-start-2">
				<span>Item Name</span>
				<input
					type="text"
					id="name"
					name="name"
					bind:value={data.item.name}
					placeholder="Really cool gift"
				/>
			</label>

			<label for="price" class="col-span-1 row-start-3 md:row-start-2">
				<span>Price</span>
				<h4 class="absolute ml-4 mt-2 z-20">$</h4>
				<input type="text" id="price" name="price" bind:value={data.item.price} class="pl-8" />
			</label>

			<label for="note" class="col-span-1 md:col-span-3">
				<span>Notes</span>
				<textarea
					name="note"
					id="note"
					rows="4"
					bind:value={data.item.note}
					placeholder="i.e. size, color, etc."
				/>
			</label>

			<button type="submit" class="btn bg-primary-500 w-min" disabled={loading}>Update</button>
		</div> -->
	</form>
{/if}
