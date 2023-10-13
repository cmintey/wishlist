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
		purchased: false,
		groupId: null
	};

	let warningHidden = false;
</script>

{#if data.suggestion && data.suggestionMethod === "approval" && !warningHidden}
	<div class="pb-4">
		<aside class="alert variant-ghost-warning">
			<div class="alert-message flex flex-row items-center space-x-4 space-y-0">
				<span><iconify-icon class="text-4xl" icon="ion:warning" /></span>
				<div>
					<span class="text-xl font-bold">Heads up!</span>
					<p class="text-sm">
						{data.owner.name} will need to approve your suggestion before it is added to their list.
					</p>
				</div>
			</div>
			<div class="alert-actions">
				<button class="variant-ghost-warning btn btn-sm" on:click={() => (warningHidden = true)}>
					OK
				</button>
			</div>
		</aside>
	</div>
{/if}

<form method="POST" use:enhance>
	<ItemForm buttonText="Add Item" data={itemData} />
</form>

<svelte:head>
	<title>
		Create Wish {!data.owner.isMe && `for ${data.owner.name}`}
	</title>
</svelte:head>
