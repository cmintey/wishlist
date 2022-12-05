<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { modalStore, toastStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import type { Item } from "@prisma/client";

	export let item: Item & {
		addedBy: {
			username: string;
		} | null;
		pledgedBy: {
			username: string;
		} | null;
		user?: {
			username: string;
		} | null;
	};

	export let user: {
		username: string;
		userId: string;
	};

	let image_url: string;

	$: {
		if (item.image_url) {
			try {
				new URL(item.image_url);
				image_url = item.image_url;
			} catch {
				image_url = `/api/assets/${item.image_url}`;
			}
		} else {
			image_url = "https://www.rosssolar.com/wp-content/uploads/2017/08/image-placeholder.jpg";
		}
	}

	const handleDelete = async (itemId: number, itemName: string) => {
		const confirm: ModalSettings = {
			type: "confirm",
			title: "Please Confirm",
			body: `Are you sure you wish to delete ${itemName}?`,
			// confirm = TRUE | cancel = FALSE
			response: async (r: boolean) => {
				if (r) {
					const resp = await fetch(`/api/items/${itemId}`, {
						method: "DELETE",
						headers: {
							"content-type": "application/json",
							accept: "application/json"
						}
					});

					if (resp.ok) {
						invalidateAll();

						toastStore.trigger({
							message: `${itemName} was deleted`,
							autohide: true,
							timeout: 5000
						});
					} else {
						toastStore.trigger({
							message: `Oops! Something went wrong.`,
							classes: "bg-warning-500",
							autohide: true,
							timeout: 5000
						});
					}
				}
			}
		};
		modalStore.trigger(confirm);
	};

	const handlePledge = async (itemId: number, unpledge = false) => {
		const resp = await fetch(`/api/items/${itemId}`, {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				accept: "application/json"
			},
			body: JSON.stringify({
				pledgedById: unpledge ? "0" : user?.userId
			})
		});

		if (resp.ok) {
			invalidateAll();

			toastStore.trigger({
				message: `${unpledge ? "Unpledged" : "Pledged"} item`,
				autohide: true,
				timeout: 5000
			});
		} else {
			toastStore.trigger({
				message: `Oops! Something went wrong.`,
				classes: "bg-warning-500",
				autohide: true,
				timeout: 5000
			});
		}
	};
</script>

<div class="card">
	<div class="card-body flex flex-row space-x-4">
		<img src={image_url} alt="product" class="w-24 md:w-32" />
		<div class="px-0 md:px-1 w-[calc(100%-7rem)] md:w-[calc(100%-9rem)]">
			<h3 class="truncate font-bold">
				{#if item.url}
					<a href={item.url} class="unstyled no-underline hover:underline">{item.name}</a>
				{:else}
					{item.name}
				{/if}
			</h3>

			{#if item.price}
				<h4>{item.price}</h4>
			{/if}

			<h5>
				Added by: {item.addedBy?.username}
				{item.user?.username ? `for ${item.user?.username}` : ""}
			</h5>
			<span>{item.note}</span>
		</div>
	</div>

	<footer class="card-footer">
		<div class="flex flex-row justify-between">
			{#if user.username === $page.params.username}
				<div />
			{:else if item.pledgedBy}
				{#if item.pledgedBy.username === user.username}
					<button
						class="btn btn-filled-primary btn-sm md:btn text-white"
						on:click={() => handlePledge(item.id, true)}>Unpledge</button
					>
				{:else}
					<span>Pledged by: {item.pledgedBy?.username}</span>
				{/if}
			{:else}
				<button
					class="btn btn-filled-primary btn-sm md:btn text-white"
					on:click={() => handlePledge(item.id)}>Pledge</button
				>
			{/if}

			{#if user.username === item.addedBy?.username}
				<div class="flex flex-row space-x-4">
					<button
						class="btn btn-filled-accent btn-sm md:btn text-white"
						on:click={() => goto(`${$page.url}/edit/${item.id}`)}>Edit</button
					>
					<button
						class="btn btn-filled-warning btn-sm md:btn text-white"
						on:click={() => handleDelete(item.id, item.name)}>Delete</button
					>
				</div>
			{/if}
		</div>
	</footer>
</div>
