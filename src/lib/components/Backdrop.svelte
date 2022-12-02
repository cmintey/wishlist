<script lang="ts">
	import { ProgressRadial } from "@skeletonlabs/skeleton";

	export let text: string;
</script>

<div
	class="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center"
>
	<div class="h-12 w-12 m-4">
		<ProgressRadial stroke={32} />
	</div>
	<span class="text-white text-center">{text}</span>
</div>
