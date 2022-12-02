<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { AppBar, Avatar, menu } from "@skeletonlabs/skeleton";
	import { signOut } from "@lucia-auth/sveltekit/client";
	import type { ClientUser } from "@lucia-auth/sveltekit/client/user";
	import type { Writable } from "svelte/store";

	type NavItem = {
		label: string;
		href: string;
	};

	export let user: ClientUser;
	export let navItems: NavItem[];
	export let drawer: Writable<boolean>;
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<div class="flex space-x-4 items-center content-center">
			{#if user}
				<button
					class="btn btn-sm p-0 pt-0.5 md:hidden"
					on:click={() => drawer.update((val) => !val)}
				>
					<iconify-icon icon="ri:menu-fill" width="20" height="20" />
				</button>
			{/if}

			<h2><a href="/">Wishlist</a></h2>
		</div>
	</svelte:fragment>

	{#if user}
		<div class="flex flex-row space-x-4 items-center pt-0.5 pl-4 hidden md:block">
			{#each navItems as navItem}
				<a href={navItem.href} class="self-center hover:underline"><b>{navItem.label}</b></a>
			{/each}
		</div>
	{/if}

	<svelte:fragment slot="trail">
		{#if user}
			<span class="relative">
				<button use:menu={{ menu: "user" }}>
					<Avatar initials={`${user.firstname.at(0)}${user.lastname.at(0)}`} />
				</button>
				<nav class="list-nav card p-4 w-fit shadow-xl" data-menu="user">
					<ul>
						<li>
							<a
								href="/login"
								on:click={async () => {
									await signOut();
									invalidateAll();
								}}>Sign Out</a
							>
							<a href="/account"> Account </a>
						</li>
					</ul>
				</nav>
			</span>
		{/if}
	</svelte:fragment>
</AppBar>
