<script lang="ts">
    import ListCard from "$lib/components/ListCard.svelte";
    import type { PageData } from "./$types";
    import { t } from "svelte-i18n";
    import IconSelector from "$lib/components/IconSelector.svelte";

    interface Props {
        data: PageData;
    }

    const { data }: Props = $props();
    const list = $state(data.list);
    let colorValue = $state();
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <label class="col-span-1 md:col-span-2" for="name">
        <span>{$t("general.name-optional")}</span>
        <input
            id="name"
            name="name"
            class="input"
            autocomplete="off"
            placeholder={$t("wishes.wishes-for", { values: { listOwner: list.owner.name } })}
            type="text"
            bind:value={list.name}
        />
    </label>
    <label class="col-span-1 flex flex-col" for="name">
        <span>{$t("general.icon-bg-color")}</span>
        <div class="grid grid-cols-[auto_1fr] gap-2">
            <input class="input" type="color" bind:value={colorValue} />
            <input class="input" readonly tabindex="-1" type="text" value={colorValue} />
        </div>
    </label>
    <div class="col-span-1">
        <IconSelector onIconSelected={(icon) => (list.icon = icon)} />
    </div>

    <div style={cssVarStyles} class="col-span-1 md:col-span-2">
        <span>Preview</span>
        <ListCard {list} />
    </div>
</div>

<svelte:head>
    <title>{$t("wishes.manage-list")}</title>
</svelte:head>
