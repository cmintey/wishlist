<script lang="ts">
	import { smtpAcknowledged } from "$lib/stores/smtp-acknowledge";
	export let smtpEnable: boolean;
</script>

{#if !$smtpAcknowledged && !smtpEnable}
	<aside class="variant-ghost-warning alert mb-2">
		<div>
			<span class="text-4xl">⚠️</span>
		</div>
		<div class="alert-message">
			<span class="text-2xl font-bold">SMTP is not enabled</span>
			<p>
				While email setup is not a requirement, users will not be able to reset their passwords via
				self-service and you will have to manually send out links to reset passwords.
			</p>
		</div>
		<div class="alert-actions">
			<a class="variant-filled-warning btn" href="/admin" target="_blank">View docs</a>
			<button class="variant-ghost-error btn-icon" on:click={() => ($smtpAcknowledged = true)}>
				<iconify-icon icon="ion:close" />
			</button>
		</div>
	</aside>
{/if}
