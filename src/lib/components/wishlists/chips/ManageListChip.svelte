<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { getFormatter } from "$lib/i18n";
    import type { MouseEventHandler } from "svelte/elements";

    interface Props {
        onclick?: MouseEventHandler<HTMLButtonElement>;
    }

    const { onclick }: Props = $props();
    const t = getFormatter();
</script>

<div>
    <button class="variant-filled-primary chip" {onclick}>
        <Icon icon="ion--build"></Icon>
        <span>{$t("wishes.manage")}</span>
    </button>
</div>
