<script lang="ts">
	import { page } from "$app/stores";
	import type { Item } from "@prisma/client";
	import Backdrop from "$lib/components/Backdrop.svelte";
	import type { ProductData } from "$lib/types";

	export let data: Item;
	export let buttonText: string;

	let form = $page.form;
	let loading = false;
	let urlChanged = false;

	const getInfo = async () => {
		if (data.url && urlChanged) {
			loading = true;
			const res = await fetch(`/api/product?url=${data.url}`);
			if (res.ok) {
				let productData: ProductData = await res.json();
				data.name = productData.name ? productData.name : productData.title || "";
				data.image_url = productData.image;
				data.price = productData.price?.toString() || null;
			} else {
				console.log("invalid url");
				console.log(await res.json());
			}
			loading = false;
			urlChanged = false;
		}
	};
</script>

<div class="grid gap-4 grid-cols-1 md:grid-cols-6">
	<label for="url" class="col-span-1 md:col-span-6">
		<span>Item URL</span>
		<input
			class="input"
			type="url"
			id="url"
			name="url"
			placeholder="Enter a URL to fetch the item data"
			bind:value={data.url}
			on:focusout={() => getInfo()}
			on:change={() => (urlChanged = true)}
		/>
	</label>

	<label for="name" class="col-span-1 md:col-span-4 row-start-2">
		<span>Item Name*</span>
		<input
			class="input"
			type="text"
			id="name"
			name="name"
			required
			bind:value={data.name}
			class:input-invalid={form?.missing}
			autocomplete="off"
		/>
		{#if form?.missing}
			<p class="unstyled pt-2 text-xs text-warning-500">Item name required</p>
		{/if}
	</label>

	<label for="price" class="col-span-1 md:col-span-2 row-start-3 md:row-start-2">
		<span>Price</span>
		<div class="input-group grid-cols-[auto_1fr]">
			<div class="input-group-shim">$</div>
			<input
				class="input"
				type="text"
				id="price"
				name="price"
				bind:value={data.price}
				autocomplete="off"
			/>
		</div>
	</label>

	<label for="image" class="col-span-1 md:col-span-2">
		<span>Upload Image</span>
		<input class="input" type="file" accept="image/*" id="image" name="image" />
	</label>

	<label for="image_url" class="col-span-1 md:col-span-4">
		<span>Image URL</span>
		<input
			class="input"
			type="text"
			id="image_url"
			name="image_url"
			bind:value={data.image_url}
			autocomplete="off"
		/>
	</label>

	<label for="note" class="col-span-1 md:col-span-6">
		<span>Notes</span>
		<textarea
			class="textarea"
			name="note"
			id="note"
			rows="4"
			placeholder="i.e. size, color, etc."
			bind:value={data.note}
		/>
	</label>

	<div class="flex flex-row space-x-4">
		<button type="submit" class="btn variant-filled-primary w-min" disabled={loading}>
			{buttonText}
		</button>
		<button type="button" class="btn variant-ghost-secondary w-min" on:click={() => history.back()}>
			Cancel
		</button>
	</div>
</div>

{#if loading}
	<Backdrop text="Hang tight, gathering product data" />
{/if}
