<script lang="ts">
	import { enhance } from "$app/forms";
	import { onMount } from "svelte";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;

	let pwdVisible = false;
	const handleClick = () => {
		pwdVisible = !pwdVisible;
	};

	onMount(() => {
		if (data.valid) window.history.replaceState({}, "", "/signup");
	});
</script>

<div class="flex flex-col space-y-4 items-center">
	<h1>Create an account</h1>

	<form method="POST" use:enhance>
		<div class="flex flex-col space-y-4">
			<label for="name">
				<span>Name</span>
				<input type="text" id="name" name="name" autocomplete="name" required />
			</label>

			<div class="flex flex-row space-x-2">
				<label for="username">
					<span>Username</span>
					<input type="text" id="username" name="username" autocomplete="username" required />
				</label>
				<label for="email">
					<span>Email</span>
					<input type="email" id="email" name="email" autocomplete="email" required />
				</label>
			</div>

			<label for="password">
				<span>Password</span>
				<div class="relative">
					<input
						type={pwdVisible ? "text" : "password"}
						id="password"
						name="password"
						class="pr-8"
						required
					/>
					<button
						class="btn-icon-sm flex absolute inset-y-0 right-0 items-center mt-1.5 pr-4 z-10"
						type="button"
						id="showpassword"
						on:click|preventDefault={handleClick}
						on:keypress|preventDefault
					>
						<iconify-icon icon="ri:{pwdVisible ? 'eye-off-fill' : 'eye-fill'}" />
					</button>
				</div>
			</label>

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

			<div class="flex space-x-4 justify-center items-center">
				<button class="btn btn-filled-primary w-min" type="submit">Sign Up</button>
				<a href="/login">Sign in</a>
			</div>
		</div>
	</form>
</div>
