<script lang="ts">
	import { enhance } from "$app/forms";
	import PasswordInput from "$lib/components/PasswordInput.svelte";
	import { onMount } from "svelte";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;

	let password = "";
	let passwordConfirm = "";

	onMount(() => {
		if (data.valid) window.history.replaceState({}, "", "/signup");
	});
</script>

<div class="flex flex-col space-y-4 items-center">
	<h1>Create an account</h1>

	<form class="w-80 md:w-1/3" method="POST" use:enhance>
		<div
			class="flex flex-col space-y-4 p-4 rounded-container-token bg-surface-100-800-token ring-outline-token"
		>
			<label for="name">
				<span>Name</span>
				<input class="input" type="text" id="name" name="name" autocomplete="name" required />
			</label>

			<div class="flex flex-col space-y-4 md:flex-row md:space-x-2 md:space-y-0">
				<label for="username">
					<span>Username</span>
					<input
						class="input"
						type="text"
						id="username"
						name="username"
						autocomplete="username"
						autocapitalize="off"
						required
					/>
				</label>
				<label for="email">
					<span>Email</span>
					<input class="input" type="email" id="email" name="email" autocomplete="email" required />
				</label>
			</div>

			<PasswordInput
				label="Password"
				id="password"
				name="password"
				required
				bind:value={password}
			/>
			<PasswordInput
				label="Confirm Password"
				id="confirmpassword"
				required
				bind:value={passwordConfirm}
			/>

			{#if password !== passwordConfirm}
				<span class="unstyled text-xs text-red-500"> Passwords must match </span>
			{/if}

			{#if form?.error}
				<ul>
					{#each form.errors as error}
						{#if error.field === "password"}
							{#each error.message.split("\n") as message}
								<li class="text-xs text-red-500">{message}</li>
							{/each}
						{:else}
							<li class="text-xs text-red-500">{error.message}</li>
						{/if}
					{/each}
				</ul>
			{/if}

			<div class="flex space-x-4 pb-2 justify-center items-center">
				<button
					class="btn variant-filled-primary w-min"
					type="submit"
					disabled={password !== passwordConfirm}>Sign Up</button
				>
				<a href="/login">Sign in</a>
			</div>
		</div>
	</form>
</div>
