<script lang="ts">
    import { browser } from "$app/environment";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { onMount } from "svelte";
    import { VirtualList } from "svelte-virtuallists";
    import fuzzysort from "fuzzysort";
    import ClearableInput from "./ClearableInput.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        id?: string;
        title?: string;
        icon?: string | null;
        onIconSelected?: (icon: string) => any;
    }

    const { id, title, icon, onIconSelected }: Props = $props();
    const t = getFormatter();

    let IconifyIcon: IconifyIconHTMLElement | undefined;
    let availableIcons: string[] = $state([]);
    let iconValue = $state(icon);
    let search = $state("");
    let searchedIcons = $derived.by(() => {
        if (availableIcons) {
            return fuzzysort.go(search, availableIcons, { all: true }).map((result) => result.target);
        }
    });

    onMount(() => {
        IconifyIcon = window.customElements.get("iconify-icon") as unknown as IconifyIconHTMLElement;
    });

    const getAvailableIcons = async () => {
        if (!browser || availableIcons.length > 0) {
            return Promise.resolve();
        }
        availableIcons = await fetch(`https://api.iconify.design/collection?prefix=ion`)
            .then((r) => r.json())
            .then((d) => d.uncategorized as unknown as string[])
            .then((icons) => icons.filter((icon) => !icon.endsWith("-sharp")));
        const iconsWithPrefix = availableIcons.map((icon) => "ion:" + icon);

        await new Promise((resolve, reject) =>
            IconifyIcon?.loadIcons
                ? IconifyIcon?.loadIcons(iconsWithPrefix, (loaded, missing, pending, _unsubscribe) => {
                      if (pending.length) {
                          return;
                      }
                      if (missing.length) {
                          reject({
                              loaded,
                              missing
                          });
                      } else {
                          resolve({
                              loaded
                          });
                      }
                  })
                : reject({})
        );
        return Promise.resolve();
    };

    const iconSelectorPopup: PopupSettings = {
        event: "focus-click",
        target: "iconSelectorPopup",
        placement: "bottom"
    };

    const partition = <T,>(items: T[], partitionSize: number) => {
        let partitioned: T[][] = [];
        for (let i = 0; i < items.length; i += partitionSize) {
            const chunk = items.slice(i, i + partitionSize);
            partitioned.push(chunk);
        }
        return partitioned;
    };
</script>

<label for={id || "name"} use:popup={iconSelectorPopup}>
    <span>{title ?? $t("general.icon")}</span>
    <ClearableInput
        id={id || "name"}
        name={id || "name"}
        class="input"
        autocomplete="off"
        clearButtonLabel={$t("a11y.clear-icon-field")}
        onValueClear={() => {
            iconValue = "";
            search = "";
        }}
        oninput={(e) => (search = e.currentTarget.value)}
        placeholder="gift"
        showClearButton={() => iconValue !== null && iconValue !== undefined}
        type="text"
        value={iconValue}
    >
        {#snippet lead()}
            <div class="input-group-shim items-center">
                <iconify-icon class="text-xl" icon={"ion:" + (iconValue || "gift")}></iconify-icon>
            </div>
        {/snippet}
    </ClearableInput>
</label>
<div class="card z-50 h-64 w-88 max-w-full overflow-auto pl-2" data-popup="iconSelectorPopup">
    {#await getAvailableIcons()}
        <span>{$t("general.loading")}</span>
    {:then}
        {@const items = partition(searchedIcons!, 7)}
        <VirtualList style="height:16rem" {items}>
            {#snippet vl_slot({ item: iconSet })}
                <div class="items flex flex-row flex-wrap gap-x-2">
                    {#each iconSet as icon}
                        <button
                            class="btn btn-icon-sm"
                            aria-label={icon + " icon"}
                            onclick={() => {
                                iconValue = icon;
                                onIconSelected?.(icon);
                            }}
                            title={icon}
                            type="button"
                        >
                            <iconify-icon class="text-xl" icon={"ion:" + icon} noobserver></iconify-icon>
                        </button>
                    {/each}
                </div>
            {/snippet}
        </VirtualList>
    {:catch}
        <span>{$t("unable-to-load-icons")}</span>
    {/await}
</div>

<style lang="css">
    :global(.vtlist-inner) {
        justify-content: center;
    }
</style>
