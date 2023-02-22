<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { modalStore, toastStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import type { Item } from "@prisma/client";

	export let item: Item & {
		addedBy: {
			username: string;
			name: string;
		} | null;
		pledgedBy: {
			username: string;
			name: string;
		} | null;
		user: {
			username: string;
			name: string;
		} | null;
	};
	export let user: {
		username: string;
		userId: string;
	};
	export let showFor = false;

	let image_url: string;

	$: {
		if (item.image_url) {
			try {
				new URL(item.image_url);
				image_url = item.image_url;
			} catch {
				image_url = `/api/assets/${item.image_url}`;
			}
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
							background: "variant-filled-warning",
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
				background: "variant-filled-warning",
				autohide: true,
				timeout: 5000
			});
		}
	};

	const handleApproval = async (
		itemId: number,
		itemName: string,
		addedBy: string | undefined,
		approve = true
	) => {
		const confirm: ModalSettings = {
			type: "confirm",
			title: "Please Confirm",
			body: `Are you sure you wish to <b>${
				approve ? "approve" : "deny"
			}</b> suggestion ${itemName} from ${addedBy}?`,
			// confirm = TRUE | cancel = FALSE
			response: async (r: boolean) => {
				if (r) {
					let resp;
					if (approve) {
						resp = await fetch(`/api/items/${itemId}`, {
							method: "PATCH",
							headers: {
								"content-type": "application/json",
								accept: "application/json"
							},
							body: JSON.stringify({
								approved: approve
							})
						});
					} else {
						resp = await fetch(`/api/items/${itemId}`, {
							method: "DELETE",
							headers: {
								"content-type": "application/json",
								accept: "application/json"
							}
						});
					}

					if (resp.ok) {
						invalidateAll();

						toastStore.trigger({
							message: `${itemName} was ${approve ? "approved" : "denied"}`,
							autohide: true,
							timeout: 5000
						});
					} else {
						toastStore.trigger({
							message: `Oops! Something went wrong.`,
							background: "variant-filled-warning",
							autohide: true,
							timeout: 5000
						});
					}
				}
			}
		};
		modalStore.trigger(confirm);
	};

	const handlePurchased = async (itemId: number, value: boolean) => {
		const resp = await fetch(`/api/items/${itemId}`, {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				accept: "application/json"
			},
			body: JSON.stringify({
				purchased: value
			})
		});

		if (resp.ok) {
			invalidateAll();
		}
	};
</script>

<div class="card" class:variant-ghost-warning={!item.approved}>
	<div class="flex flex-col space-y-2 p-4">
		<div class="flex w-full">
			<span class="truncate font-bold text-xl md:text-2xl">
				{#if item.url}
					<a class="dark:!text-primary-200" href={item.url}>{item.name}</a>
				{:else}
					{item.name}
				{/if}
			</span>
		</div>

		<div class="flex flex-row space-x-2">
			{#if image_url}
				<img src={image_url} alt="product" class="w-36" />
			{/if}

			<div class="flex flex-col">
				{#if item.price}
					<span class="text-lg font-semibold">${item.price}</span>
				{/if}

				<span class="text-base md:text-lg">
					{#if showFor}
						For <span class="text-secondary-700-200-token font-bold">{item.user?.name}</span>
					{:else}
						Added by <span class="text-secondary-700-200-token font-bold">{item.addedBy?.name}</span
						>
					{/if}
				</span>
				<p>{item.note}</p>
			</div>
		</div>
	</div>

	<footer class="card-footer">
		<div class="flex flex-row justify-between">
			{#if user.username === $page.params.username}
				<div />
			{:else if item.pledgedBy}
				{#if item.pledgedBy.username === user.username}
					<div class="flex flex-row space-x-2 md:space-x-4">
						<button
							class="btn variant-ghost-secondary btn-sm md:btn"
							on:click={() => handlePledge(item.id, true)}
						>
							Unclaim
						</button>
						<label class="unstyled flex space-x-2 items-center text-sm md:text-base">
							<input
								class="checkbox"
								type="checkbox"
								bind:checked={item.purchased}
								on:change={(event) => handlePurchased(item.id, event.currentTarget?.checked)}
							/>
							<span>Purchased</span>
						</label>
					</div>
				{:else}
					<span>Claimed by {item.pledgedBy?.name}</span>
				{/if}
			{:else}
				<button
					class="btn variant-filled-secondary btn-sm md:btn"
					on:click={() => handlePledge(item.id)}>Claim</button
				>
			{/if}

			{#if !item.approved}
				<div class="flex flex-row space-x-2 md:space-x-4">
					<button
						class="btn variant-filled-success btn-sm md:btn "
						on:click={() => handleApproval(item.id, item.name, item.addedBy?.name)}>Approve</button
					>
					<button
						class="btn variant-filled-error btn-sm md:btn "
						on:click={() => handleApproval(item.id, item.name, item.addedBy?.name, false)}
						>Deny</button
					>
				</div>
			{:else if user.username === item.user?.username || user.username === item.addedBy?.username}
				<div class="flex flex-row space-x-2 md:space-x-4">
					<button
						class="btn variant-ghost-primary btn-sm md:btn "
						on:click={() =>
							goto(`/wishlists/${item.user?.username}/edit/${item.id}?ref=${$page.url}`)}
						>Edit</button
					>
					<button
						class="btn variant-filled-error btn-sm md:btn "
						on:click={() => handleDelete(item.id, item.name)}>Delete</button
					>
				</div>
			{/if}
		</div>
	</footer>
</div>
