<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { GroupAPI, GroupsAPI } from "$lib/api/groups";
	import { UserAPI } from "$lib/api/users";
	import { Role } from "$lib/schema";
	import type { Group } from "@prisma/client";
	import {
		LightSwitch,
		modalStore,
		popup,
		type ModalSettings,
		type PopupSettings
	} from "@skeletonlabs/skeleton";
	import Avatar from "../Avatar.svelte";
	import type { User } from "lucia";

	export let user: User | undefined;

	const menuSettings: PopupSettings = {
		event: "click",
		target: "user"
	};

	let userAPI: UserAPI;
	$: if (user) userAPI = new UserAPI(user.userId);

	const createGroup = () => {
		const settings: ModalSettings = {
			type: "prompt",
			title: "Enter Group Name",
			body: "Provide the name of the group below.",
			valueAttr: { type: "text", minlength: 3, maxlength: 32, required: true },
			// Returns the updated response value
			response: async (name: string) => {
				const groupsAPI = new GroupsAPI();
				const group = await groupsAPI.create(name);
				if (user && userAPI) {
					const activeGroup = await userAPI.activeGroup();
					if (!activeGroup) await userAPI.setActiveGroup(group.id);
				}
				await invalidateAll();
				await goto("/");
			},
			// Optionally override the button text
			buttonTextCancel: "Cancel",
			buttonTextSubmit: "Submit"
		};

		modalStore.trigger(settings);
	};

	const changeGroup = (groups: Group[]) => {
		const settings: ModalSettings = {
			type: "component",
			component: "groupSelect",
			meta: {
				groups
			},
			async response(groupId: string) {
				if (groupId) {
					await userAPI.setActiveGroup(groupId);
					await invalidateAll();
				}
			}
		};
		modalStore.trigger(settings);
	};
</script>

{#if user}
	<div class="flex flex-row items-center space-x-2">
		<span class="relative">
			<button use:popup={menuSettings}>
				<Avatar {user} width="h-10 md:h-12" />
			</button>
			<nav class="card list-nav w-fit p-4 shadow-xl" data-popup="user">
				<ul>
					<li>
						<a href="/account">
							<iconify-icon icon="ion:person" />
							<p>Account</p>
						</a>
					</li>
					{#if user.roleId == Role.ADMIN}
						<li>
							<a href="/admin">
								<iconify-icon icon="ion:settings" />
								<p>Admin</p>
							</a>
						</li>
					{/if}

					<hr />

					{#await userAPI.activeGroup() then group}
						<div class="flex flex-row items-center space-x-4 px-4 py-2">
							<iconify-icon icon="ion:people" />
							<span>{group.name} Group</span>
						</div>
						{#await new GroupAPI(group.id).isManager(user.userId) then manager}
							{#if manager}
								<li>
									<button
										class="list-option w-full"
										on:click={() => goto(`/admin/groups/${group.id}`)}
									>
										<iconify-icon icon="ion:settings" />
										<p>Manage Group</p>
									</button>
								</li>
							{/if}
						{/await}
					{/await}

					{#await userAPI.groups() then groups}
						{#if groups.length > 1}
							<li>
								<button class="list-option w-full" on:click={() => changeGroup(groups)}>
									<iconify-icon icon="ion:swap-horizontal" />
									<p>Change Group</p>
								</button>
							</li>
						{/if}
					{/await}

					<li>
						<button class="list-option w-full" on:click={createGroup}>
							<iconify-icon icon="ion:add" />
							<p>Create Group</p>
						</button>
					</li>
					<hr />

					<li>
						<button
							class="list-option w-full"
							on:click={async () => {
								await fetch("/logout", { method: "POST" });
								invalidateAll();
							}}
						>
							<iconify-icon icon="ion:log-out" />
							<p>Sign Out</p>
						</button>
					</li>
					<hr class="pb-1" />
					<li>
						<div class="flex justify-around">
							<p>Mode</p>
							<LightSwitch height="h-6" width="w-12" />
						</div>
					</li>
				</ul>
			</nav>
		</span>
	</div>
{:else}
	<LightSwitch height="h-6" width="w-12" />
{/if}
