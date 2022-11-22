<script lang="ts">
	import { enhance } from "$app/forms";
</script>

<div class="flex flex-col space-y-4 items-center">
	<h1>Sign in</h1>

	<form method="POST" use:enhance>
		<div class="flex flex-col space-y-4">
			<label for="username" class="w-fit">
				<span>Username</span>
				<input type="text" id="username" name="username" />
			</label>

			<label for="password" class="w-fit">
				<span>Password</span>
				<input type="password" id="password" name="password" />
			</label>

			<div class="flex space-x-4 justify-center items-center">
				<button class="btn bg-primary-500 w-min">Log In</button>
				<a href="/signup">Create an account</a>
			</div>
		</div>
	</form>
</div>
