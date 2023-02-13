<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import type { User } from "lucia-auth";

	export let user: User;

	let editing = false;
</script>

<div class="flex flex-col">
	{#if editing}
		<form
			method="POST"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type == "success") editing = !editing;
					update();
				};
			}}
		>
			<div class="flex flex-col space-y-1">
				<label for="name">
					<span>Name</span>
					<input
						class="input"
						type="text"
						id="name"
						name="name"
						autocomplete="name"
						placeholder={user.name}
						bind:value={user.name}
					/>
				</label>

				<label for="username">
					<span>Username</span>
					<input
						class="input"
						type="text"
						id="username"
						name="username"
						autocomplete="username"
						placeholder={user.username}
						bind:value={user.username}
					/>
				</label>

				<label for="email">
					<span>Email</span>
					<input
						class="input"
						type="email"
						id="email"
						name="email"
						autocomplete="email"
						placeholder={user.email}
						bind:value={user.email}
					/>
				</label>

				{#if $page.form?.error && $page.form?.errors}
					<ul>
						{#each $page.form.errors as error}
							<li class="text-xs text-red-500">{error.message}</li>
						{/each}
					</ul>
				{/if}

				<div class="flex flex-row justify-between">
					<button type="submit" formaction="?/profile" class="btn variant-ghost-primary">
						Save
					</button>
					<button
						type="button"
						class="btn variant-ghost-secondary"
						on:click={async () => (editing = false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</form>
	{:else}
		<span class="text-2xl md:text-4xl font-bold">{user.name}</span>
		<span>{user.username}</span>
		<span>{user.email}</span>
		<button class="btn variant-ghost-primary mt-1" type="button" on:click={() => (editing = true)}>
			Edit Profile
		</button>
	{/if}
</div>
