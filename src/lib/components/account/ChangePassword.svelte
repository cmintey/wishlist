<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { toastStore } from "@skeletonlabs/skeleton";
	import PasswordInput from "../PasswordInput.svelte";

	let passwordReset = {
		current: "",
		new: "",
		confirm: ""
	};
</script>

<form
	method="POST"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === "success") {
				const t = {
					message: "Password updated successfully",
					autohide: true,
					timeout: 5000
				};

				passwordReset.current = "";
				toastStore.trigger(t);
			}

			passwordReset.new = "";
			passwordReset.confirm = "";
			update();
		};
	}}
>
	<div class="flex flex-col items-start space-y-4">
		<PasswordInput
			label="Current Password"
			id="oldpassword"
			name="oldPassword"
			autocomplete="current-password"
			bind:value={passwordReset.current}
		/>
		<PasswordInput
			label="New Password"
			id="newpassword"
			autocomplete="new-password"
			bind:value={passwordReset.new}
		/>
		<PasswordInput
			label="Confirm Password"
			id="confirmpassword"
			name="newPassword"
			autocomplete="new-password"
			bind:value={passwordReset.confirm}
		/>
		{#if passwordReset.new !== passwordReset.confirm}
			<span class="unstyled text-xs text-red-500">Passwords must match</span>
		{/if}
		{#if $page.form?.error && $page.form?.errors}
			<ul>
				{#each $page.form.errors as error}
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
			formaction="?/passwordchange"
			class="btn variant-filled-primary w-fit"
			disabled={passwordReset.current === "" ||
				passwordReset.new === "" ||
				passwordReset.new !== passwordReset.confirm}
		>
			Update Password
		</button>
	</div>
</form>
