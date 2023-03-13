<script lang="ts">
	import { enhance } from "$app/forms";
	import PasswordInput from "$lib/components/PasswordInput.svelte";
	import type { ActionData, PageServerData } from "./$types";

	export let data: PageServerData;
	export let form: ActionData;
</script>

<div class="flex flex-col items-center space-y-4">
	<h1>Sign in</h1>

	<form
		class="w-80"
		method="POST"
		use:enhance={(form) => {
			return async ({ result, update }) => {
				if (result.type === "failure") {
					form.form.reset();
				}
				await update();
			};
		}}
	>
		<div
			class="flex flex-col space-y-4 p-4 bg-surface-100-800-token rounded-container-token ring-outline-token"
		>
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
					class:input-error={form?.incorrect || form?.error}
				/>
			</label>

			<div class="relative flex flex-col space-y-4">
				<PasswordInput
					id="password"
					name="password"
					label="Password"
					required
					error={form?.incorrect || form?.error}
				/>

				{#if form?.incorrect}<span class="unstyled text-xs text-red-500">
						Invalid credentials!
					</span>{/if}
				{#if form?.error}
					<ul>
						{#each form.errors as error}
							<li class="text-xs text-red-500">{error.message}</li>
						{/each}
					</ul>
				{/if}

				<div class="flex items-center justify-center space-x-4">
					<button class="btn variant-filled-primary w-min">Log In</button>
					{#if data.enableSignup}
						<a href="/signup">Create an account</a>
					{/if}
				</div>

				<div>
					<a href="/forgot-password" class="absolute top-0 right-0 text-sm">Forgot password?</a>
				</div>
			</div>
		</div>
	</form>
</div>

<svelte:head>
	<title>Login</title>
</svelte:head>
