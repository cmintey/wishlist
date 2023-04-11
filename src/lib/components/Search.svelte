<script lang="ts">
	import fuzzysort from "fuzzysort";

	export let data: Record<string, unknown>[];
	export let keys: string[];
	export let result: typeof data;
	let search = "";

	$: result = fuzzysort
		.go(search, data, {
			keys,
			all: true
		})
		.map((result) => result.obj);
</script>

<label class="w-fit">
	<span>Search</span>
	<div class="input-group grid-cols-[auto_1fr_auto]">
		<div class="input-group-shim ">
			<iconify-icon icon="ion:search" class="text-lg" />
		</div>
		<input class="input" type="search" bind:value={search} />
	</div>
</label>
