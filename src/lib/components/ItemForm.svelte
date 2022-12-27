<script lang="ts">
	import Backdrop from "./Backdrop.svelte";

	export let data: any;
	export let form: any;
	export let buttonText: string;

	$: image = data.image || data.image_url;

	let loading = false;
	let urlChanged = false;

	const getInfo = async () => {
		if (data.url && urlChanged) {
			loading = true;
			const res = await fetch(`/api/product?url=${data.url}`);
			if (res.ok) {
				data = await res.json();
				data.name = data.name ? data.name : data.title || "";
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
			type="url"
			id="url"
			name="url"
			placeholder="https://www.amazon.com/Litfun-Womens-Memory-Slippers-Outdoor/dp/B09JVQ84VG"
			bind:value={data.url}
			on:focusout={() => getInfo()}
			on:change={() => (urlChanged = true)}
		/>
	</label>

	<label for="name" class="col-span-1 md:col-span-4 row-start-2">
		<span>Item Name*</span>
		<input
			type="text"
			id="name"
			name="name"
			placeholder="Really cool gift"
			required
			bind:value={data.name}
			class={form?.missing ? "input-invalid" : ""}
		/>
		{#if form?.missing}
			<p class="unstyled pt-2 text-xs text-warning-500">Item name required</p>
		{/if}
	</label>

	<label for="price" class="col-span-1 md:col-span-2 row-start-3 md:row-start-2">
		<span>Price</span>
		<div class="relative">
			<h4 class="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none z-10">$</h4>
			<input type="text" id="price" name="price" class="pl-8" bind:value={data.price} />
		</div>
	</label>

	<label for="image" class="col-span-1">
		<span>Upload Image</span>
		<input type="file" accept="image/*" id="image" name="image" />
	</label>

	<label for="image_url" class="col-span-1 md:col-span-5">
		<span>Image URL</span>
		<input type="url" id="image_url" name="image_url" bind:value={image} />
	</label>

	<label for="note" class="col-span-1 md:col-span-6">
		<span>Notes</span>
		<textarea
			name="note"
			id="note"
			rows="4"
			placeholder="i.e. size, color, etc."
			bind:value={data.note}
		/>
	</label>

	<button type="submit" class="btn btn-filled-primary w-min" disabled={loading}>{buttonText}</button
	>
</div>

{#if loading}
	<Backdrop text="Hang tight, gathering product data" />
{/if}
