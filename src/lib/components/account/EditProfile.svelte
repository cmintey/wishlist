<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import type { User } from "lucia-auth";

	export let user: User;
</script>

<form method="POST" use:enhance>
	<div class="flex flex-col space-y-4">
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

		<button type="submit" formaction="?/profile" class="btn variant-filled-primary w-fit">
			Update
		</button>
	</div>
</form>
