<script lang="ts">
	import "@brainandbones/skeleton/themes/theme-modern.css";
	import "@brainandbones/skeleton/styles/all.css";
	import "../app.postcss";

	import { page } from "$app/stores";
	import { handleSession, getUser } from "@lucia-auth/sveltekit/client";
	import { AppShell, Modal, Toast } from "@brainandbones/skeleton";
	import NavBar from "$lib/components/NavBar.svelte";

	handleSession(page);
	const user = getUser();
</script>

<AppShell>
	<svelte:fragment slot="header">
		<NavBar user={$user} />
	</svelte:fragment>
	<!-- Router Slot -->
	<div class="px-4 md:px-8 py-4">
		<slot />
	</div>
	<!-- ---- / ---- -->
	<svelte:fragment slot="pageFooter">
		<div class="flex justify-center">
			<span> Created with ❤️ in Minnesota </span>
		</div>
	</svelte:fragment>
</AppShell>

<Toast />
<Modal />
