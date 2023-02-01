<script lang="ts">
	import { enhance } from "$app/forms";
	import { Avatar, toastStore } from "@skeletonlabs/skeleton";
	import type { ActionData, PageServerData } from "./$types";

	export let data: PageServerData;
	export let form: ActionData;

	let name: string = data.user.name;
	let initials = name.split(" ").reduce((x, y) => x + y.at(0), "");

	let editing = false;

	let passwordReset = {
		current: "",
		new: "",
		confirm: ""
	};
</script>

<div class="mb-2">
	<h1 class="mb-2">Account</h1>
	<hr />
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Profile</h2>
	<div class="flex space-x-8 items-center">
		<div>
			<Avatar width="w-24 md:w-32" {initials} background="bg-primary-400-500-token" />
		</div>

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
								type="text"
								id="name"
								name="name"
								autocomplete="name"
								placeholder={data.user.name}
								bind:value={data.user.name}
							/>
						</label>

						<label for="username">
							<span>Username</span>
							<input
								type="text"
								id="username"
								name="username"
								autocomplete="username"
								placeholder={data.user.username}
								bind:value={data.user.username}
							/>
						</label>

						<label for="email">
							<span>Email</span>
							<input
								type="email"
								id="email"
								name="email"
								autocomplete="email"
								placeholder={data.user.email}
								bind:value={data.user.email}
							/>
						</label>

						{#if form?.error}
							<ul>
								{#each form.errors as error}
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
				<span class="text-2xl md:text-4xl font-bold">{data.user.name}</span>
				<span>{data.user.username}</span>
				<span>{data.user.email}</span>
				<button
					class="btn variant-ghost-primary mt-1"
					type="button"
					on:click={() => (editing = true)}>Edit Profile</button
				>
			{/if}
		</div>
	</div>
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Security</h2>
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
			<label>
				<span>Current Password</span>
				<input
					type="password"
					id="oldpassword"
					name="oldPassword"
					autocomplete="current-password"
					bind:value={passwordReset.current}
				/>
			</label>
			<label>
				<span>New Password</span>
				<input
					type="password"
					id="newpassword"
					autocomplete="new-password"
					bind:value={passwordReset.new}
				/>
			</label>
			<label>
				<span>Confirm Password</span>
				<input
					type="password"
					id="confirmpassword"
					name="newPassword"
					autocomplete="new-password"
					bind:value={passwordReset.confirm}
				/>
			</label>
			{#if passwordReset.new !== passwordReset.confirm}<span class="unstyled text-xs text-red-500"
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
				formaction="?/passwordchange"
				class="btn variant-filled-primary w-fit"
				disabled={passwordReset.current === "" ||
					passwordReset.new === "" ||
					passwordReset.new !== passwordReset.confirm}>Update Password</button
			>
		</div>
	</form>
</div>
