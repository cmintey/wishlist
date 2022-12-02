<script lang="ts">
	import { AccordionGroup, AccordionItem, Avatar, Divider } from "@skeletonlabs/skeleton";
	import type { PageServerData } from "./$types";

	export let data: PageServerData;
	$: name = `${data.user.firstname} ${data.user.lastname}`;
	$: console.log(data);
</script>

<div class="mb-2">
	<h1 class="mb-2">Account</h1>
	<Divider />
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Profile</h2>
	<div class="flex space-x-8">
		<Avatar
			class="w-20 md:w-32"
			initials={`${data.user.firstname.at(0)}${data.user.lastname.at(0)}`}
		/>
		<div class="flex flex-col">
			<div class="flex items-start md:space-x-1">
				<span class="text-2xl md:text-4xl font-bold">{name}</span>
				<!-- <button class="btn-icon -mt-1 pl-2 md:mt-0 text-lg md:text-2xl">
					<iconify-icon icon="ri:pencil-fill" />
				</button> -->
			</div>

			<span>{data.user.username}</span>
		</div>
	</div>
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Security</h2>
	<button class="btn bg-primary-500 w-fit" disabled>Reset Password</button>
</div>

{#if data.user.role.name === "ADMIN"}
	<div class="flex flex-col space-y-4">
		<h2>Admin</h2>

		<AccordionGroup collapse={false} padding="px-0" hover="">
			<AccordionItem>
				<svelte:fragment slot="summary"><h3>Users</h3></svelte:fragment>
				<svelte:fragment slot="content">
					<ul>
						{#each data.users as user}
							<li>
								<a href="/account/{user.username}"
									>{user.username}
									{#if user.role.name === "ADMIN"}
										<span class="text-xs italic">(admin)</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</svelte:fragment>
			</AccordionItem>
		</AccordionGroup>

		<h3>Actions</h3>
		<div class="flex space-x-2">
			<button class="btn bg-primary-500 w-fit" disabled>Invite User</button>
			<button class="btn bg-primary-500 w-fit" disabled>Clear Lists</button>
		</div>
	</div>
{/if}

<style lang="postcss">
	.btn {
		@apply text-white;
	}
</style>
