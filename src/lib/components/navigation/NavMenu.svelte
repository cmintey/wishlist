<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { GroupAPI, GroupsAPI } from "$lib/api/groups";
	import { UserAPI } from "$lib/api/users";
	import { Role } from "$lib/schema";
	import type { ClientUser } from "@lucia-auth/sveltekit/client";
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
		target: "user",
		closeQuery: "a[href], button:not(#change-group)"
	};

	const changeGroupMenuSettings: PopupSettings = {
		event: "click",
		target: "change-group-menu",
		placement: "left"
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
				invalidateAll();
			},
			// Optionally override the button text
			buttonTextCancel: "Cancel",
			buttonTextSubmit: "Submit"
		};

		modalStore.trigger(settings);
	};

	let userAPI: UserAPI;
	if ($user) userAPI = new UserAPI($user?.userId);
</script>

{#if $user}
	<div class="flex flex-row space-x-2 items-center">
		<span class="relative">
			<button use:popup={menuSettings}>
				<Avatar user={$user} />
			</button>
			<nav class="list-nav card p-4 w-fit shadow-xl" data-popup="user">
				<div class="p-2 flex flex-col">
					<span class="font-bold text-xl">{$user.name}</span>
					{#await userAPI.activeGroup() then group}
						<span>{group.name}</span>
					{/await}
				</div>
				<hr />
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
					{#await userAPI.groups() then groups}
						{#if groups.length > 1}
							<li>
								<button id="change-group" use:popup={changeGroupMenuSettings}>
									<iconify-icon icon="ion:swap-horizontal" />
									<p>Change Group</p>
								</button>
							</li>
							<nav class="list-nav card p-4 w-fit shadow-xl" data-popup="change-group-menu">
								<ul>
									{#each groups as group}
										<li>
											<button
												on:click={async () => {
													console.log("clicked");
													await userAPI.setActiveGroup(group.id);
													window.location.reload();
												}}
											>
												{group.name}
											</button>
										</li>
									{/each}
								</ul>
								<div class="arrow bg-surface-100-800-token" />
							</nav>
						{/if}
					{/await}

					<li>
						<button class="unstyled list-option" on:click={createGroup}>
							<iconify-icon icon="ion:add" />
							<p>Create Group</p>
						</button>
					</li>

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
