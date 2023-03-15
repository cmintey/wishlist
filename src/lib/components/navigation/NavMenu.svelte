<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { GroupAPI, GroupsAPI } from "$lib/api/groups";
	import { UserAPI } from "$lib/api/users";
	import { Role } from "$lib/schema";
	import type { ClientUser } from "@lucia-auth/sveltekit/client";
	import type { Group } from "@prisma/client";
	import {
		LightSwitch,
		modalStore,
		popup,
		type ModalSettings,
		type PopupSettings
	} from "@skeletonlabs/skeleton";
	import type { Readable } from "svelte/store";
	import Avatar from "../Avatar.svelte";

	export let user: Readable<ClientUser>;

	const menuSettings: PopupSettings = {
		event: "click",
		target: "user"
	};

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
				if ($user) {
					const groupAPI = new GroupAPI(group.id);
					await groupAPI.addMember($user?.userId);
				}
				await invalidateAll();
			},
			// Optionally override the button text
			buttonTextCancel: "Cancel",
			buttonTextSubmit: "Submit"
		};

		modalStore.trigger(settings);
	};

	let userAPI: UserAPI;
	$: if ($user) userAPI = new UserAPI($user?.userId);

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

{#if $user}
	<div class="flex flex-row space-x-2 items-center">
		<span class="relative">
			<button use:popup={menuSettings}>
				<Avatar user={$user} />
			</button>
			<nav class="list-nav card p-4 w-fit shadow-xl" data-popup="user">
				<ul>
					<li>
						<a href="/account">
							<iconify-icon icon="ion:person" />
							<p>Account</p>
						</a>
					</li>
					{#if $user.roleId == Role.ADMIN}
						<li>
							<a href="/admin">
								<iconify-icon icon="ion:settings" />
								<p>Admin</p>
							</a>
						</li>
					{/if}
					<hr />
					{#await userAPI.activeGroup() then group}
						<div class="px-4 py-2 flex flex-row items-center space-x-4">
							<iconify-icon icon="ion:people" />
							<span>{group.name} Group</span>
						</div>
					{/await}

					{#await userAPI.groups() then groups}
						{#if groups.length > 1}
							<li>
								<button on:click={() => changeGroup(groups)}>
									<iconify-icon icon="ion:swap-horizontal" />
									<p>Change Group</p>
								</button>
							</li>
						{/if}
					{/await}

					<li>
						<button class="unstyled list-option" on:click={createGroup}>
							<iconify-icon icon="ion:add" />
							<p>Create Group</p>
						</button>
					</li>
					<hr />

					<li>
						<button
							class="unstyled list-option"
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
