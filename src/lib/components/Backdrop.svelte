<script lang="ts">
	import { ProgressRadial } from "@skeletonlabs/skeleton";

	export let text: string;
</script>

<div
	class="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-700 opacity-90"
>
	<div class="m-4">
		<ProgressRadial
			meter="stroke-primary-500"
			stroke={64}
			track="stroke-primary-500/30"
			width="w-16"
		/>
	</div>
	<span class="text-center text-white">{text}</span>
</div>
