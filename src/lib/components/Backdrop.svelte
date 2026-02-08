<script lang="ts">
    interface Props {
        text: string;
    }

    let { text }: Props = $props();
</script>

<div
    class="fixed top-0 right-0 bottom-0 left-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-700 opacity-90"
>
    <span class="loading loading-spinner text-primary-500 m-4 w-8 md:w-12"></span>
    <span class="text-center text-white">{text}</span>
</div>
