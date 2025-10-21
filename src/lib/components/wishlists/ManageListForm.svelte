<script lang="ts">
    import ListCard from "$lib/components/ListCard.svelte";
    import IconSelector from "$lib/components/IconSelector.svelte";
    import { enhance } from "$app/forms";
    import ClearableInput from "$lib/components/ClearableInput.svelte";
    import { rgbToHex } from "$lib/util";
    import type { List, User } from "@prisma/client";
    import { getFormatter } from "$lib/i18n";
    import MarkdownEditor from "../MarkdownEditor.svelte";
    import ConfirmModal from "../modals/ConfirmModal.svelte";

    interface ListProps extends Partial<Pick<List, "id" | "icon" | "iconColor" | "name" | "public" | "description">> {
        owner: Pick<User, "name" | "username" | "picture">;
    }

    interface Props {
        data: {
            list: ListProps;
        };
        persistButtonName: string;
        listMode: ListMode;
        allowsPublicLists: boolean;
        editing?: boolean;
    }

    const { data, persistButtonName, listMode, allowsPublicLists, editing = false }: Props = $props();
    const t = getFormatter();
    const formId: string = $props.id();

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

    $effect(() => {
        if (!colorValue) colorValue = defaultColor;
    });
</script>

<form
    id={formId}
    action="?/persist"
    method="POST"
    use:enhance={async (e) => {
        if (e.formData.get("iconColor") === defaultColor) {
            e.formData.delete("iconColor");
        }
    }}
>
    <div class="grid grid-cols-12 gap-4 pb-4">
        <div class="col-span-full flex w-full flex-row flex-wrap gap-4">
            <label class="grow" for="name">
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

            {#if allowsPublicLists || listMode === "registry"}
                <label class="unstyled mt-8 flex flex-row items-center gap-x-2" for="public">
                    <input
                        id="public"
                        name="public"
                        class="checkbox"
                        checked={list.public || listMode === "registry"}
                        disabled={listMode === "registry"}
                        type="checkbox"
                    />
                    <span>{$t("wishes.public")}</span>
                </label>
            {/if}
        </div>

        <label class="col-span-full flex flex-col md:col-span-4" for="iconColor">
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
        <div class="col-span-full md:col-span-8">
            <IconSelector id="icon" icon={list.icon} onIconSelected={(icon) => (list.icon = icon)} />
        </div>

        <div class="col-span-full">
            <label>
                <span>{$t("general.description")}</span>
                <MarkdownEditor
                    id="description"
                    name="description"
                    placeholder={$t("general.add-a-description")}
                    value={list.description}
                />
            </label>
        </div>

        <div class="col-span-full">
            <div class="flex flex-col space-y-2">
                <span>{$t("wishes.preview")}</span>
                <ListCard hideCount {list} preventNavigate />
            </div>
        </div>
    </div>

    <div class="flex flex-row flex-wrap justify-between gap-4">
        <button
            class="preset-tonal-secondary border-secondary-500 btn w-min border"
            onclick={() => history.back()}
            type="button"
        >
            {$t("general.cancel")}
        </button>
        <div class="flex flex-row gap-x-4">
            {#if editing}
                <ConfirmModal
                    confirmButtonProps={{ type: "submit", form: formId, formaction: "?/delete" }}
                    description={$t("wishes.delete-list-confirmation")}
                >
                    {#snippet trigger(props)}
                        <button {...props} class="preset-filled-error-500 btn w-min">
                            {$t("wishes.delete")}
                        </button>
                    {/snippet}
                </ConfirmModal>
            {/if}
            <button class="preset-filled-primary-500 btn w-min" type="submit">
                {persistButtonName}
            </button>
        </div>
    </div>
</form>

<div bind:this={colorElement} class="bg-primary-500 hidden"></div>
