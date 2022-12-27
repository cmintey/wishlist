<script lang="ts">
	import { enhance } from "$app/forms";
	import { focusTrap } from "@skeletonlabs/skeleton";
	import type { ActionData } from "./$types";

	export let form: ActionData;
	let password = "";
</script>

<div class="flex flex-col space-y-4 items-center">
	<h1>Sign in</h1>

	<form
		method="POST"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === "failure") {
					password = "";
				}
				await update();
			};
		}}
	>
		<div class="flex flex-col space-y-4" use:focusTrap={true}>
			<label for="username" class="w-fit">
				<span>Username</span>
				<input
					type="text"
					id="username"
					name="username"
					autocomplete="username"
					autocapitalize="off"
					required
				/>
			</label>

			<div class="flex flex-col space-y-4 relative">
				<label for="password" class="w-fit">
					<span>Password</span>
					<input type="password" id="password" name="password" bind:value={password} required />
				</label>

				{#if form?.incorrect}<span class="unstyled text-xs text-red-500">Invalid credentials!</span
					>{/if}
				{#if form?.error}
					<ul>
						{#each form.errors as error}
							<li class="text-xs text-red-500">{error.message}</li>
						{/each}
					</ul>
				{/if}

				<div class="flex space-x-4 justify-center items-center">
					<button class="btn btn-filled-primary w-min">Log In</button>
					<a href="/signup">Create an account</a>
				</div>

				<div>
					<a href="/" class="text-sm absolute top-0 right-0">Forgot password?</a>
				</div>
			</div>
		</div>
	</form>
</div>
