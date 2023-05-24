<script lang="ts">
	export let approvalCount: number;
</script>

{#if approvalCount > 0}
	<aside class="variant-ghost-primary alert">
		<div><iconify-icon class="text-4xl" icon="ion:information-circle" /></div>
		<div class="alert-message">
			<span class="text-2xl font-bold">Approval Needed</span>
			<p>You have {approvalCount} item{approvalCount > 1 ? "s" : ""} awaiting your approval</p>
		</div>
		<div class="alert-actions">
			<a class="btn variant-filled-primary" href="/wishlists/me">View Wishes</a>
		</div>
	</aside>
{/if}
