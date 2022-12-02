<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "../$types";

	export let form: ActionData;

	let pwdVisible = false;
	const handleClick = () => {
		pwdVisible = !pwdVisible;
	};
</script>

<div class="flex flex-col space-y-4 items-center">
	<h1>Create an account</h1>

	<form method="POST" use:enhance>
		<div class="flex flex-col space-y-4">
			<label for="firstname">
				<span>First Name</span>
				<input type="text" id="firstname" name="firstname" required />
			</label>

			<label for="lastname">
				<span>Last Name</span>
				<input type="text" id="lastname" name="lastname" required />
			</label>

			<label for="username">
				<span>Username</span>
				<input type="text" id="username" name="username" required />
			</label>

			<label for="password">
				<span>Password</span>
				<div class="relative">
					<button
						class="btn flex absolute inset-y-0 right-0 items-center pr-4 z-10"
						on:click|preventDefault={handleClick}
					>
						<iconify-icon icon="ri:{pwdVisible ? 'eye-off-fill' : 'eye-fill'}" />
					</button>

					<input
						type={pwdVisible ? "text" : "password"}
						id="password"
						name="password"
						class="pr-8"
						required
					/>
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

			<div class="flex justify-center">
				<button class="btn bg-primary-500 w-min">Sign Up</button>
			</div>
		</div>
	</form>
</div>
