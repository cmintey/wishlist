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
	<h3>SMTP</h3>
	<label class="unstyled flex flex-row space-x-2">
		<input
			class="checkbox"
			type="checkbox"
			name="enableSMTP"
			id="enableSMTP"
			bind:checked={enabled}
		/>
		<span>Enable</span>
	</label>
	{#if enabled}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 w-fit">
			<label class="w-fit">
				<span>Host</span>
				<input
					class="input"
					type="text"
					name="smtpHost"
					id="smtpHost"
					autocomplete="off"
					required
					bind:value={host}
				/>
			</label>
			<label class="w-fit">
				<span>Port</span>
				<input
					class="input"
					type="text"
					name="smtpPort"
					id="smtpPort"
					autocomplete="off"
					required
					bind:value={port}
				/>
			</label>
			<label class="w-fit">
				<span>User</span>
				<input
					class="input"
					type="text"
					name="smtpUser"
					id="smtpUser"
					autocomplete="off"
					required
					bind:value={user}
				/>
			</label>
			<PasswordInput label="Password" name="smtpPass" id="smtpPass" required bind:value={pass} />
			<label class="w-fit">
				<span>From Email</span>
				<input
					class="input"
					type="text"
					name="smtpFrom"
					id="smtpFrom"
					autocomplete="off"
					required
					bind:value={from}
				/>
			</label>
			<label class="w-fit">
				<span>From Name</span>
				<input
					class="input"
					type="text"
					name="smtpFromName"
					id="smtpFromName"
					autocomplete="off"
					required
					bind:value={fromName}
				/>
			</label>
		</div>
	{/if}
</div>
