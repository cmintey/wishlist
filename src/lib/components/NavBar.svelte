<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { AppBar, Avatar, menu, drawerStore } from "@skeletonlabs/skeleton";
	import { signOut } from "@lucia-auth/sveltekit/client";
	import type { ClientUser } from "@lucia-auth/sveltekit/client/user";

	type NavItem = {
		label: string;
		href: string;
	};

	export let user: ClientUser;
	export let navItems: NavItem[];
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<div class="flex space-x-4 items-center content-center">
			{#if user}
				<button class="btn btn-sm p-0 pt-0.5 md:hidden" on:click={() => drawerStore.open({})}>
					<iconify-icon icon="ri:menu-fill" width="20" height="20" />
				</button>
			{/if}

			<h2><a href="/">Wishlist</a></h2>
		</div>
	</svelte:fragment>

	{#if user}
		<div class="flex-row space-x-4 items-center pt-0.5 pl-4 hidden md:block">
			{#each navItems as navItem}
				<a href={navItem.href} class="self-center hover:underline" data-sveltekit-preload-data
					><b>{navItem.label}</b></a
				>
			{/each}
		</div>
	{/if}

	<svelte:fragment slot="trail">
		{#if user}
			<span class="relative">
				<button use:menu={{ menu: "user" }}>
					<Avatar initials={user.name.split(" ").reduce((x, y) => x + y.at(0), "")} />
				</button>
				<nav class="list-nav card p-4 w-fit shadow-xl" data-menu="user">
					<ul>
						<li>
							<button
								class="unstyled option"
								on:click={async () => {
									await signOut();
									invalidateAll();
								}}>Sign Out</button
							>
							<a href="/account"> Account </a>
							{#if user.roleId == 2}
								<a href="/admin">Admin</a>
							{/if}
						</li>
					</ul>
				</nav>
			</span>
		{/if}
	</svelte:fragment>
</AppBar>
