<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import type { Item } from "@prisma/client";
	import { ItemAPI } from "$lib/api/items";

	type PartialUser = {
		username: string;
		name: string;
	};

	export let item: Item & {
		addedBy: PartialUser | null;
		pledgedBy: PartialUser | null;
		user: PartialUser | null;
	};
	export let user: PartialUser & { userId: string };
	export let showFor = false;

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	let image_url: string;
	const itemAPI = new ItemAPI(item.id);

	$: if (item.image_url) {
		try {
			new URL(item.image_url);
			image_url = item.image_url;
		} catch {
			image_url = `/api/assets/${item.image_url}`;
		}
	}

	const triggerErrorToast = () => {
		toastStore.trigger({
			message: `Oops! Something went wrong.`,
			background: "variant-filled-warning",
			autohide: true,
			timeout: 5000
		});
	};

	const confirmDeleteModal: ModalSettings = {
		type: "confirm",
		title: "Please Confirm",
		body: `Are you sure you wish to delete ${item.name}?`,
		// confirm = TRUE | cancel = FALSE
		response: async (r: boolean) => {
			if (r) {
				const resp = await itemAPI.delete();

				if (resp.ok) {
					invalidateAll();

					toastStore.trigger({
						message: `${item.name} was deleted`,
						autohide: true,
						timeout: 5000
					});
				} else {
					triggerErrorToast();
				}
			}
		}
	};

	const approvalModal = (approve: boolean): ModalSettings => ({
		type: "confirm",
		title: "Please Confirm",
		body: `Are you sure you wish to <b>${approve ? "approve" : "deny"}</b> suggestion ${
			item.name
		} from ${item.addedBy?.name}?`,
		response: async (r: boolean) => {
			if (r) {
				const resp = await (approve ? itemAPI.approve() : itemAPI.deny());

				if (resp.ok) {
					invalidateAll();

					toastStore.trigger({
						message: `${item.name} was ${approve ? "approved" : "denied"}`,
						autohide: true,
						timeout: 5000
					});
				} else {
					triggerErrorToast();
				}
			}
		}
	});

	const handleDelete = async () => modalStore.trigger(confirmDeleteModal);
	const handleApproval = async (approve = true) => modalStore.trigger(approvalModal(approve));

	const handleClaim = async (unclaim = false) => {
		const resp = await (unclaim ? itemAPI.unclaim() : itemAPI.claim(user.userId));

		if (resp.ok) {
			invalidateAll();

			toastStore.trigger({
				message: `${unclaim ? "Unclaimed" : "Claimed"} item`,
				autohide: true,
				timeout: 5000
			});
		} else {
			triggerErrorToast();
		}
	};

	const handlePurchased = async (purchased: boolean) => {
		const resp = await (purchased ? itemAPI.purchase() : itemAPI.unpurchase());

		if (resp.ok) {
			invalidateAll();
		}
	};
</script>

<div class="card" class:variant-ghost-warning={!item.approved}>
	<header class="card-header">
		<div class="flex w-full">
			<span class="truncate text-xl font-bold md:text-2xl">
				{#if item.url}
					<a class="dark:!text-primary-200" href={item.url} rel="noreferrer" target="_blank">
						{item.name}
					</a>
				{:else}
					{item.name}
				{/if}
			</span>
		</div>
	</header>

	<div class="flex flex-row space-x-2 p-4">
		{#if image_url}
			<img class="h-36 w-36 object-contain" alt="product" src={image_url} />
		{/if}

		<div class="flex flex-col">
			{#if item.price}
				<span class="text-lg font-semibold">${item.price}</span>
			{/if}

			<span class="text-base md:text-lg">
				{#if showFor}
					For <span class="text-secondary-700-200-token font-bold">{item.user?.name}</span>
				{:else}
					Added by <span class="text-secondary-700-200-token font-bold">{item.addedBy?.name}</span>
				{/if}
			</span>
			<p class="whitespace-pre-wrap">{item.note}</p>
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
							class="variant-ghost-secondary btn btn-sm md:btn"
							on:click={() => handleClaim(true)}
						>
							Unclaim
						</button>
						<label class="unstyled flex items-center space-x-2 text-sm md:text-base">
							<input
								class="checkbox"
								type="checkbox"
								bind:checked={item.purchased}
								on:change={(event) => handlePurchased(event.currentTarget?.checked)}
							/>
							<span>Purchased</span>
						</label>
					</div>
				{:else}
					<span>Claimed by {item.pledgedBy?.name}</span>
				{/if}
			{:else}
				<button class="variant-filled-secondary btn btn-sm md:btn" on:click={() => handleClaim()}>
					Claim
				</button>
			{/if}

			<div class="flex flex-row space-x-2 md:space-x-4">
				{#if !item.approved}
					<button
						class="variant-filled-success btn btn-sm md:btn"
						on:click={() => handleApproval(true)}
					>
						Approve
					</button>
					<button
						class="variant-filled-error btn btn-sm md:btn"
						on:click={() => handleApproval(false)}
					>
						Deny
					</button>
				{:else if user.username === item.user?.username || user.username === item.addedBy?.username}
					<button
						class="variant-ghost-primary btn btn-sm md:btn"
						on:click={() =>
							goto(`/wishlists/${item.user?.username}/edit/${item.id}?ref=${$page.url}`)}
					>
						Edit
					</button>
					<button class="variant-filled-error btn btn-sm md:btn" on:click={handleDelete}>
						Delete
					</button>
				{/if}
			</div>
		</div>
	</footer>
</div>
