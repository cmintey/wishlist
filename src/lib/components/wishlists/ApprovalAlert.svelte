<script lang="ts">
	export let approvalCount: number;
</script>

{#if approvalCount > 0}
	<aside class="alert variant-ghost-primary">
		<div><iconify-icon icon="ion:information-circle" class="text-4xl" /></div>
		<div class="alert-message">
			<span class="text-2xl font-bold">Approval Needed</span>
			<p>You have {approvalCount} item{approvalCount > 1 ? "s" : ""} awaiting your approval</p>
		</div>
		<div class="alert-actions">
			<a href="/wishlists/me" class="btn variant-filled-primary">View Wishes</a>
		</div>
	</aside>
{/if}
