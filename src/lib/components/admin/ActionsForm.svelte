<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { modalStore, toastStore, type ModalSettings } from "@skeletonlabs/skeleton";

	const handleDelete = async () => {
		const settings: ModalSettings = {
			type: "confirm",
			title: "Please Confirm",
			body: `Are you sure you wish to clear all wishlists? <b>This action is irreversible!</b>`,
			// confirm = TRUE | cancel = FALSE
			response: async (r: boolean) => {
				if (r) {
					const resp = await fetch(`/api/items`, {
						method: "DELETE",
						headers: {
							"content-type": "application/json",
							accept: "application/json"
						}
					});

					if (resp.ok) {
						invalidateAll();

						toastStore.trigger({
							message: "All wishlists cleared.",
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
		modalStore.trigger(settings);
	};
</script>

<div class="flex space-x-2">
	<button class="variant-ghost-error btn w-fit" type="button" on:click={handleDelete}>
		Clear Lists
	</button>
</div>
