<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { getUser } from "@lucia-auth/sveltekit/client";
	import { AppBar, Avatar, menu, drawerStore, LightSwitch } from "@skeletonlabs/skeleton";
	import logo from "$lib/assets/logo.png";

	type NavItem = {
		label: string;
		href: string;
	};

	export let navItems: NavItem[];

	const user = getUser();
</script>

<AppBar background="bg-surface-200-700-token">
	<svelte:fragment slot="lead">
		<div class="flex space-x-4 items-center content-center">
			{#if user}
				<button class="btn btn-sm p-0 pt-0.5 md:hidden" on:click={() => drawerStore.open({})}>
					<iconify-icon icon="ion:menu" class="text-2xl" />
				</button>
			{/if}

			<a class="flex flex-row space-x-2 items-center" href="/">
				<img src={logo} alt="Wishlist Logo" class="h-14" />
				<span class="text-4xl font-bold text-primary-900-50-token"> Wishlist </span>
			</a>
		</div>
	</svelte:fragment>

	{#if $user}
		<div class="flex-row items-center pt-0.5 pl-4 hidden md:flex">
			{#each navItems as navItem}
				<a
					href={navItem.href}
					class="unstyled hover:bg-primary-hover-token rounded-token px-4 py-2 font-bold"
					data-sveltekit-preload-data
				>
					{navItem.label}
				</a>
			{/each}
		</div>
	{/if}

	<svelte:fragment slot="trail">
		<LightSwitch />
		{#if $user}
			<span class="relative">
				<button use:menu={{ menu: "user" }}>
					<Avatar
						initials={$user.name.split(" ").reduce((x, y) => x + y.at(0), "")}
						background="bg-primary-400-500-token"
					/>
				</button>
				<nav class="list-nav card p-4 w-fit shadow-xl" data-menu="user">
					<ul>
						<li>
							<a href="/account"> Account </a>
							{#if $user.roleId == 2}
								<a href="/admin"> Admin </a>
							{/if}
							<button
								class="unstyled list-option"
								on:click={async () => {
									await fetch("/logout", { method: "POST" });
									invalidateAll();
								}}
							>
								Sign Out
							</button>
						</li>
					</ul>
				</nav>
			</span>
		{/if}
	</svelte:fragment>
</AppBar>
