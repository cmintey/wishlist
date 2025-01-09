<script lang="ts">
    import { t } from "svelte-i18n";
    import type { MouseEventHandler } from "svelte/elements";

    interface Props {
        onclick?: MouseEventHandler<HTMLButtonElement>;
    }

    let { onclick }: Props = $props();
</script>

<div>
    <button class="variant-filled-primary chip" {onclick}>
        <iconify-icon icon="ion:build"></iconify-icon>
        <span>{$t("wishes.manage")}</span>
    </button>
</div>
