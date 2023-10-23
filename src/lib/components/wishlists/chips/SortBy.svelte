<script lang="ts">
	import BaseChip from "./BaseChip.svelte";

	const options: Option[] = [
		{
			value: "default",
			displayValue: "Default Sort"
		},
		{
			value: "price",
			direction: "asc",
			displayValue: "Price: Low to High"
		},
		{
			value: "price",
			direction: "desc",
			displayValue: "Price: High to Low"
		}
	];

	const defaultOption = options[0];
	const searchParam = "sort";
	const directionParam = "dir";
	const prefix = "ion:swap-vertical";
</script>

<BaseChip {defaultOption} {directionParam} {options} {prefix} {searchParam} />
