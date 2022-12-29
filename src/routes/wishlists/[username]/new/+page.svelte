<script lang="ts">
	import { enhance } from "$app/forms";
	import ItemForm from "$lib/components/ItemForm.svelte";
	import type { Item } from "@prisma/client";
	import type { ActionData } from "./$types";

	export let form: ActionData;

	let data: Item = {
		id: 0,
		name: "",
		price: null,
		url: null,
		note: null,
		image_url: null,
		userId: null,
		addedById: null,
		pledgedById: null
	};
</script>

<form method="POST" use:enhance>
	<ItemForm {form} {data} buttonText="Add Item" />
</form>
