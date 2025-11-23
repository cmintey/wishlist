<script lang="ts">
    import { getFormatter } from "$lib/i18n";

    interface Props {
        showArchived: boolean;
        onToggle?: VoidFunction;
    }

    let { showArchived = $bindable(), onToggle }: Props = $props();
    const t = getFormatter();

    const handleClick = () => {
        showArchived = !showArchived;
        onToggle?.();
    };
</script>

<button
    class={["chip", showArchived ? "variant-filled-warning" : "variant-ringed-warning"].join(" ")}
    onclick={handleClick}
    title={$t("wishes.archive")}
    aria-label={$t("wishes.archive")}
>
    <iconify-icon icon="ion:archive-outline"></iconify-icon>
    <span>{$t("wishes.archive")}</span>
</button>


