<script lang="ts">
	import { page } from "$app/stores";
	import type { Item } from "@prisma/client";
	import Backdrop from "$lib/components/Backdrop.svelte";

	export let data: Item;
	export let buttonText: string;

	$: form = $page.form;
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
			}
			loading = false;
			urlChanged = false;
		}
	};
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-6">
	<label class="col-span-1 md:col-span-6" for="url">
		<span>Item URL</span>
		<input
			id="url"
			name="url"
			class="input"
			placeholder="Enter a URL to fetch the item data"
			type="url"
			bind:value={data.url}
			on:focusout={() => getInfo()}
			on:change={() => (urlChanged = true)}
		/>
	</label>

	<label class="col-span-1 row-start-2 md:col-span-4" for="name">
		<span>Item Name*</span>
		<input
			id="name"
			name="name"
			class="input"
			class:input-invalid={form?.missing}
			autocomplete="off"
			required
			type="text"
			bind:value={data.name}
		/>
		{#if form?.missing}
			<p class="unstyled pt-2 text-xs text-warning-500">Item name required</p>
		{/if}
	</label>

	<label class="col-span-1 row-start-3 md:col-span-2 md:row-start-2" for="price">
		<span>Price</span>
		<div class="input-group grid-cols-[auto_1fr]">
			<div class="input-group-shim">$</div>
			<input
				id="price"
				name="price"
				class="input"
				autocomplete="off"
				type="text"
				bind:value={data.price}
			/>
		</div>
	</label>

	<label class="col-span-1 md:col-span-2" for="image">
		<span>Upload Image</span>
		<input id="image" name="image" class="input" accept="image/*" type="file" />
	</label>

	<label class="col-span-1 md:col-span-4" for="image_url">
		<span>Image URL</span>
		<input
			id="image_url"
			name="image_url"
			class="input"
			autocomplete="off"
			type="text"
			bind:value={data.image_url}
		/>
	</label>

	<label class="col-span-1 md:col-span-6" for="note">
		<span>Notes</span>
		<textarea
			id="note"
			name="note"
			class="textarea"
			placeholder="i.e. size, color, etc."
			rows="4"
			bind:value={data.note}
		/>
	</label>

	<div class="flex flex-row space-x-4">
		<button class="btn variant-filled-primary w-min" disabled={loading} type="submit">
			{buttonText}
		</button>
		<button class="variant-ghost-secondary btn w-min" type="button" on:click={() => history.back()}>
			Cancel
		</button>
	</div>
</div>

{#if loading}
	<Backdrop text="Hang tight, gathering product data" />
{/if}
