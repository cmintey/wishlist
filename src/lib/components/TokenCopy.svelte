<script lang="ts">
    import { Portal, Tooltip } from "@skeletonlabs/skeleton-svelte";
    import { fade } from "svelte/transition";
    import { getFormatter } from "$lib/i18n";
    import type { ClassValue } from "svelte/elements";
    import { clipboard } from "$lib/clipboard.svelte";

    interface Props {
        url: string;
        btnStyle?: ClassValue;
        children?: import("svelte").Snippet;
        onCopied?: VoidFunction;
    }

    let { url, btnStyle = "btn-icon", children, onCopied }: Props = $props();
    const t = getFormatter();

    let copiedVisible = $state(false);
</script>

<div class="flex flex-row items-center">
    <span class="text-ellipsis">
        <a class="aside" href={url}>
            {@render children?.()}
        </a>
        <span id="tokenUrl" hidden>{url}</span>
    </span>
    <div class="flex flex-row items-center">
        <Tooltip>
            <Tooltip.Trigger
                class="btn {btnStyle}"
                {@attach clipboard("tokenUrl")}
                aria-label={$t("general.copy-to-clipboard")}
                onclick={() => {
                    onCopied?.();
                    copiedVisible = true;
                    setTimeout(() => (copiedVisible = false), 1000);
                }}
                type="button"
            >
                <iconify-icon icon="ion:copy"></iconify-icon>
            </Tooltip.Trigger>
            <Portal>
                <Tooltip.Positioner>
                    <Tooltip.Content class="card preset-filled-secondary-500 p-2">
                        <span>{$t("general.copy-to-clipboard")}</span>
                        <Tooltip.Arrow
                            class="[--arrow-background:var(--color-secondary-500)] [--arrow-size:--spacing(2)]"
                        >
                            <Tooltip.ArrowTip />
                        </Tooltip.Arrow>
                    </Tooltip.Content>
                </Tooltip.Positioner>
            </Portal>
        </Tooltip>

        {#if copiedVisible}
            <span out:fade>{$t("general.copied")}</span>
        {/if}
    </div>
</div>
