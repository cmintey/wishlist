<script lang="ts">
	import { enhance } from "$app/forms";
	import ItemForm from "$lib/components/ItemForm.svelte";
	import type { ActionData } from "./$types";

	export let form: ActionData;

	let data: ProductData = {
		brand: null,
		name: null,
		url: null,
		image: null,
		currency: null,
		condition: null,
		sku: null,
		mpn: null,
		availability: null,
		price: null,
		asin: null,
		hostname: null,
		retailer: null,
		title: null
	};
</script>

<form method="POST" use:enhance>
	<ItemForm {form} {data} buttonText="Add Item" />
</form>
