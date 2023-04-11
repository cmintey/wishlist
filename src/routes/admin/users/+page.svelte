<script lang="ts">
	import Users from "$lib/components/admin/Users.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<Users users={data.users} currentUser={data.user} config={data.config} groups={data.groups} />
