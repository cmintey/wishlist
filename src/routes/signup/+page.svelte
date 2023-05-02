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

<div class="flex flex-col items-center space-y-4">
	<h1>Create an account</h1>

	<form class="w-80 md:w-1/3" method="POST" use:enhance>
		<div
			class="flex flex-col space-y-4 p-4 bg-surface-100-800-token rounded-container-token ring-outline-token"
		>
			<input id="tokenId" name="tokenId" class="hidden" value={data.id} />
			<label for="name">
				<span>Name</span>
				<input id="name" name="name" class="input" autocomplete="name" required type="text" />
			</label>

			<div class="flex flex-col space-y-4 md:flex-row md:space-x-2 md:space-y-0">
				<label for="username">
					<span>Username</span>
					<input
						id="username"
						name="username"
						class="input"
						autocapitalize="off"
						autocomplete="username"
						required
						type="text"
					/>
				</label>
				<label for="email">
					<span>Email</span>
					<input id="email" name="email" class="input" autocomplete="email" required type="email" />
				</label>
			</div>

			<PasswordInput
				id="password"
				name="password"
				label="Password"
				required
				strengthMeter
				bind:value={password}
			/>
			<PasswordInput
				id="confirmpassword"
				label="Confirm Password"
				required
				bind:value={passwordConfirm}
			/>

			{#if password !== passwordConfirm}
				<span class="unstyled text-xs text-red-500">Passwords must match</span>
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

			<div class="flex items-center justify-center space-x-4 pb-2">
				<button
					class="btn variant-filled-primary w-min"
					disabled={password !== passwordConfirm}
					type="submit"
				>
					Sign Up
				</button>
				<a href="/login">Sign in</a>
			</div>
		</div>
	</form>
</div>

<svelte:head>
	<title>Signup</title>
</svelte:head>
