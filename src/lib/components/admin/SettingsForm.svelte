<script lang="ts">
	import { enhance } from "$app/forms";
	import { ProgressRadial } from "@skeletonlabs/skeleton";

	// eslint-disable-next-line no-undef
	export let config: Config;
	$: saved = config ? false : false;
	let sending = false;
	let sent = false;
</script>

<!-- TODO: Add tooltips explaining the various settings -->
<form
	method="POST"
	action="?/settings"
	use:enhance={({ action }) => {
		if (action.search === "?/send-test") {
			sending = true;
		}
		return ({ action, result }) => {
			if (action.search === "?/settings" && result.type === "success") {
				saved = true;
			}
			if (action.search === "?/send-test" && result.type === "success") {
				sending = false;
				sent = true;
			}
		};
	}}
>
	<div class="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
		<div class="flex flex-col space-y-2">
			<h3>Public Signup</h3>
			<label class="unstyled flex flex-row space-x-2">
				<input
					type="checkbox"
					name="enableSignup"
					id="enableSignup"
					bind:checked={config.enableSignup}
				/>
				<span>Enable</span>
			</label>
		</div>

		<div class="flex flex-col space-y-2">
			<h3>Suggestions</h3>
			<label class="unstyled flex flex-row space-x-2">
				<input
					type="checkbox"
					name="enableSuggestions"
					id="enableSuggestions"
					bind:checked={config.suggestions.enable}
				/>
				<span>Enable</span>
			</label>
			{#if config.suggestions.enable}
				<label class="w-fit">
					<span>Method</span>
					<select
						name="suggestionMethod"
						id="suggestionMethod"
						bind:value={config.suggestions.method}
					>
						<option value="surprise">Surprise Me</option>
						<option value="auto-approval">Auto-Approve</option>
						<option value="approval">Approval Required</option>
					</select>
				</label>
			{/if}
		</div>
	</div>
	<div class="flex flex-col space-y-2">
		<h3>SMTP</h3>
		<label class="unstyled flex flex-row space-x-2">
			<input type="checkbox" name="enableSMTP" id="enableSMTP" bind:checked={config.smtp.enable} />
			<span>Enable</span>
		</label>
		{#if config.smtp.enable}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 w-fit">
				<label class="w-fit">
					<span>Host</span>
					<input
						type="text"
						name="smtpHost"
						id="smtpHost"
						autocomplete="off"
						required
						bind:value={config.smtp.host}
					/>
				</label>
				<label class="w-fit">
					<span>Port</span>
					<input
						type="text"
						name="smtpPort"
						id="smtpPort"
						autocomplete="off"
						required
						bind:value={config.smtp.port}
					/>
				</label>
				<label class="w-fit">
					<span>User</span>
					<input
						type="text"
						name="smtpUser"
						id="smtpUser"
						autocomplete="off"
						required
						bind:value={config.smtp.user}
					/>
				</label>
				<label class="w-fit">
					<span>Password</span>
					<input
						type="password"
						name="smtpPass"
						id="smtpPass"
						autocomplete="off"
						required
						bind:value={config.smtp.pass}
					/>
				</label>
				<label class="w-fit">
					<span>From Email</span>
					<input
						type="text"
						name="smtpFrom"
						id="smtpFrom"
						autocomplete="off"
						required
						bind:value={config.smtp.from}
					/>
				</label>
				<label class="w-fit">
					<span>From Name</span>
					<input
						type="text"
						name="smtpFromName"
						id="smtpFromName"
						autocomplete="off"
						required
						bind:value={config.smtp.fromName}
					/>
				</label>
			</div>
		{/if}
	</div>
	<div class="flex space-x-4 mt-2 items-end">
		<button class="btn variant-filled-primary mt-2" type="submit">
			{#if saved}
				<iconify-icon icon="ri:check-line" />
				<p>Saved</p>
			{:else}
				Save
			{/if}
		</button>
		{#if saved && config.smtp.enable}
			<button
				class="btn variant-ghost-primary mt-2 w-fit h-min"
				type="submit"
				formaction="?/send-test"
				disabled={sending || sent}
			>
				{#if sending}
					<span class="h-6 w-6">
						<ProgressRadial stroke={64} />
					</span>
				{:else if sent}
					<iconify-icon icon="ri:check-line" />
					<p>Sent</p>
				{:else}
					Test Email
				{/if}
			</button>
		{/if}
	</div>
</form>
