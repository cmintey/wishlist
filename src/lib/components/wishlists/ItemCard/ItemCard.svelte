<script context="module" lang="ts">
	export type PartialUser = {
		username: string;
		name: string;
	};
	export type FullItem = Item & {
		addedBy: PartialUser | null;
		pledgedBy: PartialUser | null;
		user: PartialUser | null;
	};
</script>

<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import {
		getDrawerStore,
		getModalStore,
		getToastStore,
		type DrawerSettings,
		type ModalSettings
	} from "@skeletonlabs/skeleton";
	import type { Item } from "@prisma/client";
	import { ItemAPI } from "$lib/api/items";
	import ApprovalButtons from "./ApprovalButtons.svelte";
	import ClaimButtons from "./ClaimButtons.svelte";

	export let item: FullItem;
	export let user: PartialUser & { userId: string };
	export let showFor = false;

	const modalStore = getModalStore();
	const toastStore = getToastStore();
	const drawerStore = getDrawerStore();

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

	const drawerSettings: DrawerSettings = {
		id: "item",
		position: "bottom",
		height: "max-h-fit",
		meta: {
			item,
			showFor
		}
	};

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

<button
	class="card card-hover block text-start"
	class:variant-ghost-warning={!item.approved}
	type="button"
	on:click={() => drawerStore.open(drawerSettings)}
>
	<header class="card-header">
		<div class="flex w-full">
			<span class="line-clamp-2 text-xl font-bold md:text-2xl">
				{#if item.url}
					<a
						class="dark:!text-primary-200"
						href={item.url}
						rel="noreferrer"
						target="_blank"
						on:click|stopPropagation
					>
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
				<span class="text-lg font-semibold">{item.price}</span>
			{/if}

			<span class="text-base md:text-lg">
				{#if showFor}
					For <span class="text-secondary-700-200-token font-bold">{item.user?.name}</span>
				{:else}
					Added by <span class="text-secondary-700-200-token font-bold">{item.addedBy?.name}</span>
				{/if}
			</span>
			<p class="line-clamp-4 whitespace-pre-wrap">{item.note}</p>
		</div>
	</div>

	<footer class="card-footer flex flex-row justify-between">
		<ClaimButtons
			{item}
			{user}
			on:claim={() => handleClaim()}
			on:unclaim={() => handleClaim(true)}
			on:purchase={(event) => handlePurchased(event.detail.purchased)}
		/>

		<ApprovalButtons
			{item}
			{user}
			on:approve={() => handleApproval(true)}
			on:deny={() => handleApproval(false)}
			on:delete={handleDelete}
		/>
	</footer>
</button>
