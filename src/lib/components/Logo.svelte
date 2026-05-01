<script lang="ts">
    interface Props {
        class?: string;
    }
    const { class: className }: Props = $props();
</script>

<svg class={className} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <!-- Highlighter Mark -->
    <path d="M100 600 L 924 500 L 924 700 L 100 800 Z" fill="#F4FF41" />
    <!-- Shark Fin -->
    <path
        class="fill-surface-900 dark:fill-surface-100 transition-colors duration-200"
        d="M350 670 
           C 400 670, 550 630, 600 300 
           C 520 500, 420 600, 350 670 Z"
    />
</svg>
