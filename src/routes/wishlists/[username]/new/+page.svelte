<script lang="ts">
	import { enhance } from "$app/forms";
	import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
	import type { Item } from "@prisma/client";
	import type { PageData } from "./$types";

	export let data: PageData;

	let itemData: Item = {
		id: 0,
		name: "",
		price: null,
		url: null,
		note: null,
		image_url: null,
		userId: "",
		addedById: "",
		pledgedById: null,
		approved: true,
		purchased: false
	};

	let warningHidden = false;
</script>

{#if data.suggestion && data.suggestionMethod === "approval" && !warningHidden}
	<div class="pb-4">
		<aside class="alert variant-ghost-warning">
			<iconify-icon icon="ri:alert-fill" class="text-5xl hidden md:block" />
			<div class="alert-message">
				<span class="text-2xl font-bold">Heads up!</span>
				<p>
					You are making a suggestion to {data.owner.name}. {data.owner.name} will need to approve your
					suggestion before it is added to their list.
				</p>
			</div>
			<div class="alert-actions">
				<button class="btn variant-ghost-warning" on:click={() => (warningHidden = true)}>
					Acknowledge
				</button>
			</div>
		</aside>
	</div>
{/if}

<form method="POST" use:enhance>
	<ItemForm data={itemData} buttonText="Add Item" />
</form>
