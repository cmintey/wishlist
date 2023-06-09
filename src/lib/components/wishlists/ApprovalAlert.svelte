<script lang="ts">
	export let approvalCount: number;
</script>

{#if approvalCount > 0}
	<aside class="variant-ghost-primary alert">
		<div class="alert-message flex flex-row items-center space-x-4 space-y-0">
			<div><iconify-icon class="text-4xl" icon="ion:information-circle" /></div>
			<div class="flex flex-col">
				<span class="text-xl font-bold">Approval Needed</span>
				<p class="text-sm">
					You have {approvalCount} item{approvalCount > 1 ? "s" : ""} awaiting your approval
				</p>
			</div>
		</div>
		<div class="alert-actions">
			<a class="btn btn-sm variant-filled-primary" href="/wishlists/me">View Wishes</a>
		</div>
	</aside>
{/if}
