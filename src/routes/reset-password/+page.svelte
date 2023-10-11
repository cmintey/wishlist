<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import PasswordInput from "$lib/components/PasswordInput.svelte";
	import { onMount } from "svelte";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;

	let newPassword = "";
	let confirmPassword = "";

	onMount(() => {
		if (data.valid) window.history.replaceState({}, "", "/reset-password");
		else goto("/");
	});
</script>

{#if data.valid}
	<div class="flex flex-col items-center space-y-4">
		<h1 class="h1">Reset Password</h1>

		<form
			class="w-80"
			method="POST"
			use:enhance={({ data: formData }) => {
				formData.append("userId", data.userId || "");
				formData.append("id", `${data.id}` || "0");
			}}
		>
			<div
				class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token"
			>
				<PasswordInput
					id="password"
					name="password"
					autocomplete="new-password"
					label="New Password"
					required
					strengthMeter
					bind:value={newPassword}
				/>
				<PasswordInput
					id="confirmpassword"
					autocomplete="new-password"
					label="Confirm Password"
					required
					bind:value={confirmPassword}
				/>

				{#if newPassword !== confirmPassword}
					<span class="unstyled text-xs text-red-500">Passwords must match</span>
				{/if}

				{#if form?.error}
					<ul>
						{#each form.errors as error}
							{#if error.field === "newPassword"}
								{#each error.message.split("\n") as message}
									<li class="text-xs text-red-500">{message}</li>
								{/each}
							{:else}
								<li class="text-xs text-red-500">{error.message}</li>
							{/if}
						{/each}
					</ul>
				{/if}
				<button
					class="variant-filled-primary btn w-fit"
					disabled={newPassword === "" || newPassword !== confirmPassword}
					type="submit"
				>
					Update Password
				</button>
			</div>
		</form>
	</div>
{/if}

{#if form?.success}
	<div class="flex flex-col items-center space-y-4">
		<div class="flex w-80 flex-col items-center space-y-1 text-center md:w-full">
			<iconify-icon icon="ion:checkmark-circle-outline" width="100" />
			<span class="text-xl font-bold">Success!</span>
			<p>
				Your password was reset. <a href="/login">Click here</a>
				to login.
			</p>
		</div>
	</div>
{/if}

<svelte:head>
	<title>Reset Password</title>
</svelte:head>
