<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
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
	<div class="flex flex-col space-y-4 items-center">
		<h1>Reset Password</h1>

		<form
			method="POST"
			class="w-80"
			use:enhance={({ data: formData }) => {
				formData.append("userId", data.userId || "");
				formData.append("id", `${data.id}` || "0");
				console.log(formData);
			}}
		>
			<div
				class="flex flex-col space-y-4 p-4 rounded-container-token bg-surface-100-800-token ring-outline-token"
			>
				<label>
					<span>New Password</span>
					<input
						type="password"
						id="newpassword"
						autocomplete="new-password"
						bind:value={newPassword}
					/>
				</label>
				<label>
					<span>Confirm Password</span>
					<input
						type="password"
						id="confirmpassword"
						name="newPassword"
						autocomplete="new-password"
						bind:value={confirmPassword}
					/>
				</label>
				{#if newPassword !== confirmPassword}<span class="unstyled text-xs text-red-500"
						>Passwords must match</span
					>{/if}
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
					type="submit"
					class="btn btn-filled-primary w-fit"
					disabled={newPassword === "" || newPassword !== confirmPassword}>Update Password</button
				>
			</div>
		</form>
	</div>
{/if}

{#if form?.success}
	<div class="flex flex-col space-y-4 items-center">
		<div class="flex flex-col space-y-1 items-center text-center w-80 md:w-full">
			<iconify-icon icon="ri:checkbox-circle-line" width="100" />
			<span class="text-xl font-bold">Success!</span>
			<p>Your password was reset. <a href="/login">Click here</a> to login.</p>
		</div>
	</div>
{/if}
