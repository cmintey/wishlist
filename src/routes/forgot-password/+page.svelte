<script lang="ts">
	import { enhance } from "$app/forms";
	import Backdrop from "$lib/components/Backdrop.svelte";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;

	let loading = false;
</script>

{#if data.smtpEnabled}
	<div class="flex flex-col items-center space-y-4">
		<h1>Reset Password</h1>
		{#if form?.success}
			<div class="flex w-80 flex-col items-center space-y-1 text-center md:w-full">
				<iconify-icon icon="ion:checkmark-circle-outline" width="100" />
				<span class="text-xl font-bold">Success!</span>
				<p>Check your email and follow the link to reset your password.</p>
			</div>
		{:else}
			<p class="w-80 text-center">
				Enter your email address and we'll send you a password reset link.
			</p>
			<form
				method="POST"
				class="w-80"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<div
					class="flex flex-col space-y-4 p-4 bg-surface-100-800-token rounded-container-token ring-outline-token"
				>
					<label for="email" class="w-full">
						<span>Email</span>
						<input
							class="input"
							type="email"
							name="email"
							id="email"
							required
							class:input-invalid={form?.error}
						/>
					</label>
					{#if form?.error}
						<span class="text-xs text-error-700-200-token">
							Please provide a valid email address.
						</span>
					{/if}

					<div>
						<button type="submit" class="btn variant-filled-primary">Submit</button>
					</div>
				</div>
			</form>
		{/if}
	</div>
{:else}
	<div class="flex flex-col items-center space-y-4">
		<h1>Self-service password reset unavailable.</h1>
		<span class="text-xl">Please contact the site administrator to reset your password.</span>
		<a href="/login">Return to login</a>
	</div>
{/if}

{#if loading}
	<Backdrop text="Processing..." />
{/if}

<svelte:head>
	<title>Forgot Password</title>
</svelte:head>
