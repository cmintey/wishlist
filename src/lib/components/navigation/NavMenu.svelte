<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import type { ClientUser } from "@lucia-auth/sveltekit/client";
	import { Avatar, LightSwitch, popup, type PopupSettings } from "@skeletonlabs/skeleton";
	import type { Readable } from "svelte/store";

	export let user: Readable<ClientUser>;

	const menuSettings: PopupSettings = {
		event: "click",
		target: "user"
	};
</script>

{#if $user}
	<div class="flex flex-row space-x-2 items-center">
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
						<a href="/account">
							<iconify-icon icon="ion:person" />
							<p>Account</p>
						</a>
					</li>
					{#if $user.roleId == 2}
						<li>
							<a href="/admin">
								<iconify-icon icon="ion:settings" />
								<p>Admin</p>
							</a>
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
							<iconify-icon icon="ion:log-out" />
							<p>Sign Out</p>
						</button>
					</li>
					<hr class="pb-1" />
					<li>
						<div class="flex justify-center space-x-1">
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
