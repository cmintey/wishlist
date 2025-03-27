<script lang="ts">
    import ListCard from "$lib/components/ListCard.svelte";
    import { t } from "svelte-i18n";
    import IconSelector from "$lib/components/IconSelector.svelte";
    import { enhance } from "$app/forms";
    import ClearableInput from "$lib/components/ClearableInput.svelte";
    import { rgbToHex } from "$lib/util";
    import type { List, User } from "@prisma/client";
    import { getModalStore } from "@skeletonlabs/skeleton";

    interface ListProps extends Partial<Pick<List, "id" | "icon" | "iconColor" | "name">> {
        owner: Pick<User, "name" | "username" | "picture">;
    }

    interface Props {
        data: {
            list: ListProps;
        };
        persistButtonName: string;
        editing?: boolean;
    }

    const { data, persistButtonName, editing = false }: Props = $props();
    const modalStore = getModalStore();

    let list = $state(data.list);
    let colorElement: Element | undefined = $state();
    let defaultColor: string = $derived.by(() => {
        if (colorElement) {
            const rgbColor = getComputedStyle(colorElement).backgroundColor;
            const rgbValues = rgbColor.match(/\d+/g)?.map(Number.parseFloat);
            return rgbValues ? rgbToHex(rgbValues[0], rgbValues[1], rgbValues[2]) : "";
        }
        return list.iconColor || "";
    });
    let colorValue: string | null = $state((() => defaultColor)());

    const handleDelete = async () => {
        return new Promise((resolve, reject) => {
            return modalStore.trigger({
                type: "confirm",
                title: $t("general.please-confirm"),
                body: $t("wishes.delete-list-confirmation"),
                response(confirmed: boolean) {
                    if (!confirmed) {
                        reject();
                    } else {
                        resolve(null);
                    }
                },
                buttonTextCancel: $t("general.cancel"),
                buttonTextConfirm: $t("general.confirm")
            });
        });
    };

    $effect(() => {
        if (!colorValue) colorValue = defaultColor;
    });
</script>

<form
    action="?/persist"
    method="POST"
    use:enhance={async (e) => {
        if (e.formData.get("iconColor") === defaultColor) {
            e.formData.delete("iconColor");
        }
        if (e.action.search === "?/delete") {
            await handleDelete().catch(() => e.cancel());
        }
    }}
>
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

        <label class="col-span-1 flex flex-col" for="iconColor">
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
        <div class="flex flex-row space-x-4">
            {#if editing}
                <button class="variant-filled-error btn w-min" formaction="?/delete" type="submit">
                    {$t("wishes.delete")}
                </button>
            {/if}
            <button class="variant-filled-primary btn w-min" type="submit">
                {persistButtonName}
            </button>
        </div>
    </div>
</form>

<div bind:this={colorElement} class="bg-primary-400-500-token hidden"></div>
