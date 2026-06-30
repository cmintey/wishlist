<script lang="ts">
    import { browser } from "$app/environment";
    import { Combobox, Portal, useListCollection, type ComboboxRootProps } from "@skeletonlabs/skeleton-svelte";
    import { onMount } from "svelte";
    import fuzzysort from "fuzzysort";
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

    const collection = $derived(
        useListCollection({
            items: availableIcons
        })
    );

    let filteredIcons: string[] = $state([]);

    const onOpenChange = async () => {
        await getAvailableIcons();
        filteredIcons = availableIcons;
    };

    const onInputValueChange: ComboboxRootProps["onInputValueChange"] = (event) => {
        if (event.reason === "item-select") {
            iconValue = event.inputValue;
            onIconSelected?.(iconValue);
        }
        search = event.inputValue;
        filteredIcons = fuzzysort.go(event.inputValue, availableIcons, { all: true }).map((result) => result.target);
        if (filteredIcons.find((i) => i === search)) {
            iconValue = search;
        }
    };
</script>

<Combobox
    name={id || "name"}
    class="w-full gap-0"
    {collection}
    inputBehavior="autohighlight"
    {onInputValueChange}
    {onOpenChange}
    openOnClick
    placeholder="gift"
>
    <Combobox.Label class="text-base">{title ?? $t("general.icon")}</Combobox.Label>
    <Combobox.Control>
        <Combobox.Input>
            {#snippet element(props)}
                <div class="input-group grid grid-cols-[auto_1fr]">
                    <div class="ig-cell preset-tonal items-center">
                        <iconify-icon icon={"ion:" + (iconValue || "gift")}></iconify-icon>
                    </div>
                    <input {...props} class="ig-input" />
                </div>
            {/snippet}
        </Combobox.Input>
        <Combobox.Trigger />
    </Combobox.Control>
    <Portal>
        <Combobox.Positioner class="z-1!">
            <Combobox.Content
                class="grid h-64 max-w-full auto-rows-max grid-cols-6 items-start overflow-auto pl-2 md:grid-cols-12"
            >
                {#each filteredIcons as item (item)}
                    <Combobox.Item class="flex justify-center" {item}>
                        <Combobox.ItemText class="flex items-center ">
                            <iconify-icon class="inline-block text-xl" icon={"ion:" + item} noobserver></iconify-icon>
                        </Combobox.ItemText>
                    </Combobox.Item>
                {/each}
            </Combobox.Content>
        </Combobox.Positioner>
    </Portal>
</Combobox>
