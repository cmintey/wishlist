<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { AppBar, Avatar, menu } from "@brainandbones/skeleton";
	import { signOut } from "@lucia-auth/sveltekit/client";
	import type { ClientUser } from "@lucia-auth/sveltekit/client/user";

	export let user: ClientUser;
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<h2><a href="/">Wishlist</a></h2>
	</svelte:fragment>

	{#if user}
		<div class="flex flex-row space-x-4 items-center pt-0.5 pl-4">
			<a href="/wishlists/{user?.username}" class="self-center"><b>My List</b></a>
			<a href="/pledges" class="self-center"><b>My Pledges</b></a>
		</div>
	{/if}

	<svelte:fragment slot="trail">
		{#if user}
			<span class="relative">
				<button use:menu={{ menu: "user" }}>
					<Avatar initials={user.username.at(0)} />
				</button>
				<nav class="list-nav card p-4 w-fit shadow-xl" data-menu="user">
					<ul>
						<li>
							<button
								class="btn"
								on:click={async () => {
									await signOut();
									invalidateAll();
								}}>Sign Out</button
							>
						</li>
					</ul>
				</nav>
			</span>
		{/if}
	</svelte:fragment>
</AppBar>
