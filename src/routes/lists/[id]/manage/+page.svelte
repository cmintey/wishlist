<script lang="ts">
    import ListCard from "$lib/components/ListCard.svelte";
    import type { PageData } from "./$types";
    import { t } from "svelte-i18n";
    import IconSelector from "$lib/components/IconSelector.svelte";
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import ClearableInput from "$lib/components/ClearableInput.svelte";

    interface Props {
        data: PageData;
    }

    const { data }: Props = $props();
    const defaultColor = "#a940bf"; // this is actually dynamic based on the theme, but easier to hardcode the value
    const list = $state(data.list);
    let colorValue: string = $state(list.iconColor || defaultColor);

    $effect(() => {
        if ($page.form && !$page.form.success && $page.form.errors === null) {
            getToastStore().trigger({
                message: $t("errors.unable-to-update-list-settings"),
                background: "variant-filled-error"
            });
        }
    });
</script>

<form method="POST" use:enhance>
    <div class="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
        <label class="col-span-1 md:col-span-2" for="name">
            <span>{$t("auth.name")}</span>
            <ClearableInput
                id="name"
                name="name"
                class="input"
                autocomplete="off"
                clearButtonLabel={$t("a11y.clear-name-field")}
                onValueClear={() => (list.name = null)}
                placeholder={$t("wishes.wishes-for", { values: { listOwner: list.owner.name } })}
                showClearButton={() => list.name !== null}
                type="text"
                bind:value={list.name}
            />
        </label>

        <label class="col-span-1 flex flex-col" for="name">
            <span>{$t("general.icon-bg-color")}</span>
            <div class="grid grid-cols-[auto_1fr] gap-2">
                <input
                    id="iconColor"
                    name="iconColor"
                    class="input"
                    onchange={(e) => (list.iconColor = e.currentTarget?.value)}
                    type="color"
                    bind:value={colorValue}
                />
                <ClearableInput
                    class="input"
                    clearButtonLabel={$t("a11y.clear-color-field")}
                    onValueClear={() => {
                        colorValue = defaultColor;
                        list.iconColor = defaultColor;
                    }}
                    readonly
                    showClearButton={() => colorValue !== defaultColor}
                    tabindex={-1}
                    type="text"
                    value={colorValue}
                />
            </div>
        </label>
        <div class="col-span-1">
            <IconSelector id="icon" icon={list.icon} onIconSelected={(icon) => (list.icon = icon)} />
        </div>

        <div class="col-span-1 md:col-span-2">
            <div class="flex flex-col space-y-2">
                <span>{$t("wishes.preview")}</span>
                <ListCard hideCount {list} preventNavigate />
            </div>
        </div>
    </div>

    <div class="flex flex-row justify-between">
        <button class="variant-ghost-secondary btn w-min" onclick={() => history.back()} type="button">
            {$t("general.cancel")}
        </button>
        <button class="variant-filled-primary btn w-min" type="submit">
            {$t("general.save")}
        </button>
    </div>
</form>

<svelte:head>
    <title>{$t("wishes.manage-list")}</title>
</svelte:head>
