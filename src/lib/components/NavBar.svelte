<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { getUser } from "@lucia-auth/sveltekit/client";
	import {
		AppBar,
		Avatar,
		drawerStore,
		LightSwitch,
		popup,
		type PopupSettings
	} from "@skeletonlabs/skeleton";
	import logo from "$lib/assets/logo.png";
	import { page } from "$app/stores";

	export let navItems: NavItem[];

	const user = getUser();

	const menuSettings: PopupSettings = {
		event: "click",
		target: "user"
	};
</script>

<AppBar background="bg-surface-200-700-token">
	<svelte:fragment slot="lead">
		<div class="flex space-x-4 items-center content-center">
			{#if user}
				<button
					class="btn btn-sm p-0 pt-0.5 md:hidden"
					on:click={() =>
						drawerStore.open({
							width: "w-[280px] md:w-[480px]"
						})}
				>
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
					class="list-option px-4 py-2 font-bold"
					data-sveltekit-preload-data
					class:variant-filled-primary={$page.url.pathname === navItem.href}
				>
					{navItem.label}
				</a>
			{/each}
		</div>
	{/if}

	<svelte:fragment slot="trail">
		<div class="flex flex-row space-x-2 items-center">
			{#if $user}
				<span class="relative">
					<button use:popup={menuSettings}>
						<Avatar
							initials={$user.name.split(" ").reduce((x, y) => x + y.at(0), "")}
							background="bg-primary-400-500-token"
						/>
					</button>
					<nav class="list-nav card p-4 w-fit shadow-xl" data-popup="user">
						<ul>
							<li>
								<a href="/account"> Account </a>
							</li>
							{#if $user.roleId == 2}
								<li>
									<a href="/admin"> Admin </a>
								</li>
							{/if}
							<li>
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
							<li>
								<div class="flex justify-center">
									<LightSwitch height="h-6" width="w-12" />
								</div>
							</li>
						</ul>
					</nav>
				</span>
			{:else}
				<LightSwitch height="h-6" width="w-12" />
			{/if}
		</div>
	</svelte:fragment>
</AppBar>
