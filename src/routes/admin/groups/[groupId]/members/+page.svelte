<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { GroupAPI } from "$lib/api/groups";
	import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import type { PageData } from "./$types";
	import InviteUser from "$lib/components/admin/InviteUser.svelte";

	export let data: PageData;

	const modalStore = getModalStore();

	type UserData = (typeof data.group.users)[number];

	const groupAPI = new GroupAPI($page.params.groupId);
	const head = ["Name", "Username", "Email"];
	const dataKeys = ["name", "username", "email"] as (keyof UserData)[];

	const addUserModalSettings: ModalSettings = {
		type: "component",
		component: "addUser",
		response: async (userId: string) => {
			await groupAPI.addMember(userId);
			invalidateAll();
		}
	};

	const toggleManager = async (userId: string, manager: boolean) => {
		modalStore.trigger({
			type: "confirm",
			title: `${manager ? "Add" : "Remove"} Manager`,
			body: `Are you sure you want to ${manager ? "add" : "remove"} this user as group manager?`,
			async response(r) {
				if (!r) return;

				if (manager) await groupAPI.makeManager(userId);
				else await groupAPI.removeManager(userId);

				await invalidateAll();
			}
		});
	};

	const removeMember = (userId: string) => {
		modalStore.trigger({
			type: "confirm",
			title: "Remove Member",
			body: "Are you sure you want to remove this user from the group?",
			async response(r) {
				if (!r) return;

				await groupAPI.removeMember(userId);
				await invalidateAll();
			}
		});
	};

	const deleteGroup = () => {
		modalStore.trigger({
			type: "confirm",
			title: "Delete Group",
			body: "Are you sure you want to delete this group? This action is <b>irreversible</b>!",
			async response(r) {
				if (!r) return;

				const group = await groupAPI.delete();
				if (group) {
					await invalidateAll();
					goto("/");
				}
			}
		});
	};
</script>

<div class="flex space-x-4 py-4">
	<button
		class="variant-filled-primary btn"
		type="button"
		on:click={() => modalStore.trigger(addUserModalSettings)}
	>
		<iconify-icon icon="ion:person-add" />
		<span>Add Member</span>
	</button>
	<InviteUser config={data.config} defaultGroup={data.group} />
</div>

<div class="flex flex-col space-y-2">
	<div class="table-container">
		<table class="table table-interactive" role="grid">
			<thead class="table-head">
				<tr>
					{#each head as label}
						<th>
							{label}
						</th>
					{/each}
					<th>Manager</th>
					<th>Remove</th>
				</tr>
			</thead>
			<tbody class="table-body">
				{#each data.group.users as user, row}
					<tr aria-rowindex={row}>
						{#each dataKeys as key, col}
							<td aria-colindex={col} role="gridcell" tabindex={col === 0 ? 0 : -1}>
								{user[key]}
							</td>
						{/each}
						<td>
							<button
								class="btn-icon"
								on:click={() => toggleManager(user.id, !user.isGroupManager)}
							>
								<iconify-icon icon="ion:sparkles{user.isGroupManager ? '' : '-outline'}" />
							</button>
						</td>
						<td aria-colindex={dataKeys.length} role="gridcell" tabindex={-1}>
							<button class="btn-icon" on:click={() => removeMember(user.id)}>
								<iconify-icon icon="ion:trash-bin" />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<button class="variant-filled-error btn w-fit" on:click={deleteGroup}>Delete Group</button>
</div>
