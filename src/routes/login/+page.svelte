<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData, PageServerData } from "./$types";

	export let data: PageServerData;
	export let form: ActionData;

	let pwdVisible = false;
	const handleClick = () => {
		pwdVisible = !pwdVisible;
	};
</script>

<div class="flex flex-col space-y-4 items-center">
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
			class="flex flex-col space-y-4 p-4 rounded-container-token bg-surface-100-800-token ring-outline-token"
		>
			<label for="username">
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
					{#if data.enableSignup}
						<a href="/signup">Create an account</a>
					{/if}
				</div>

				<div>
					<a href="/forgot-password" class="text-sm absolute top-0 right-0">Forgot password?</a>
				</div>
			</div>
		</div>
	</form>
</div>
