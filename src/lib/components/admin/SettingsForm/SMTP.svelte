<script lang="ts">
	import PasswordInput from "$lib/components/PasswordInput.svelte";

	export let enabled: boolean;
	export let host: string | undefined | null;
	export let port: number | undefined | null;
	export let user: string | undefined | null;
	export let pass: string | undefined | null;
	export let from: string | undefined | null;
	export let fromName: string | undefined | null;
</script>

<div class="flex flex-col space-y-2">
	<h2 class="h2">SMTP</h2>
	<label class="unstyled flex flex-row space-x-2">
		<input
			id="enableSMTP"
			name="enableSMTP"
			class="checkbox"
			type="checkbox"
			bind:checked={enabled}
		/>
		<span>Enable</span>
	</label>
	{#if enabled}
		<div class="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
			<label for="smtpHost">
				<span>Host</span>
				<input
					id="smtpHost"
					name="smtpHost"
					class="input"
					autocomplete="off"
					required
					type="text"
					bind:value={host}
				/>
			</label>
			<label for="smtpPort">
				<span>Port</span>
				<input
					id="smtpPort"
					name="smtpPort"
					class="input"
					autocomplete="off"
					required
					type="text"
					bind:value={port}
				/>
			</label>
			<label for="smtpUser">
				<span>User</span>
				<input
					id="smtpUser"
					name="smtpUser"
					class="input"
					autocomplete="off"
					required
					type="text"
					bind:value={user}
				/>
			</label>
			<PasswordInput id="smtpPass" name="smtpPass" label="Password" required bind:value={pass} />
			<label for="smtpFrom">
				<span>From Email</span>
				<input
					id="smtpFrom"
					name="smtpFrom"
					class="input"
					autocomplete="off"
					required
					type="text"
					bind:value={from}
				/>
			</label>
			<label for="smtpFromName">
				<span>From Name</span>
				<input
					id="smtpFromName"
					name="smtpFromName"
					class="input"
					autocomplete="off"
					required
					type="text"
					bind:value={fromName}
				/>
			</label>
		</div>
	{/if}
</div>
