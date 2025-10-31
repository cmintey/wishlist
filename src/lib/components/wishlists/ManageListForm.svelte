<script lang="ts">
    import ListCard from "$lib/components/ListCard.svelte";
    import IconSelector from "$lib/components/IconSelector.svelte";
    import { enhance } from "$app/forms";
    import ClearableInput from "$lib/components/ClearableInput.svelte";
    import { rgbToHex } from "$lib/util";
    import type { List, User } from "@prisma/client";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { getFormatter } from "$lib/i18n";
    import MarkdownEditor from "../MarkdownEditor.svelte";
    import { page } from "$app/state";
    import Tooltip from "../Tooltip.svelte";

    interface ListProps extends Partial<Pick<List, "id" | "icon" | "iconColor" | "name" | "public" | "description">> {
        owner: Pick<User, "name" | "username" | "picture">;
        managers: Pick<User, "id" | "name" | "email">[];
    }

    interface Props {
        list: ListProps;
        persistButtonName: string;
        listMode: ListMode;
        allowsPublicLists: boolean;
        groupId: string;
        editing?: boolean;
    }

    const { list, persistButtonName, listMode, allowsPublicLists, groupId, editing = false }: Props = $props();
    const t = getFormatter();
    const modalStore = getModalStore();

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
    let managers = $state(list.managers);

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

    const addManager = () => {
        modalStore.trigger({
            type: "component",
            component: "selectListManager",
            meta: {
                groupId,
                managers: [list.owner, ...managers]
            },
            response(user: { id: string; name: string; email: string }) {
                managers = [...managers, user];
            }
        });
    };

    const removeManager = (id: string) => {
        managers = managers.filter((user) => user.id !== id);
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
    <div class="grid grid-cols-12 gap-4 pb-4">
        <div class="col-span-full flex w-full flex-row flex-wrap gap-4">
            <label class="flex-grow" for="name">
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

        <fieldset
            class="col-span-full flex min-w-0 flex-col space-y-2 md:col-span-5"
            aria-labelledby="list-managers-label"
        >
            <div class="flex items-end justify-between">
                <Tooltip>
                    {#snippet label()}
                        <legend id="list-managers-label">{$t("wishes.list-managers")}</legend>
                    {/snippet}
                    {#snippet description()}
                        <p>{$t("wishes.list-managers-tooltip")}</p>
                    {/snippet}
                </Tooltip>
                <button class="variant-ghost-primary btn btn-sm" onclick={addManager} type="button">
                    {$t("wishes.add-a-manager")}
                </button>
            </div>

            <div
                class="border-surface-400-500-token flex h-36 flex-col space-y-2 overflow-y-scroll p-2 border-token rounded-container-token"
                class:input-error={page.form?.errors?.managers}
                data-testid="list-managers-list"
            >
                {#if managers.length === 0}
                    <span class="subtext">{$t("wishes.no-managers")}</span>
                {/if}
                {#each managers as manager (manager.id)}
                    <label class="flex items-center justify-between" for={manager.id}>
                        <div class="flex items-center gap-x-2 truncate">
                            <p class="truncate" data-part="name">{manager.name}</p>
                            <span class="subtext truncate" data-part="email">{manager.email}</span>
                        </div>
                        <button class="flex items-center" onclick={() => removeManager(manager.id)} type="button">
                            <iconify-icon icon="ion:close"></iconify-icon>
                            <span class="sr-only">
                                {$t("a11y.remove-manager-name", { values: { name: manager.name } })}
                            </span>
                        </button>
                    </label>
                    <input id={manager.id} name="managers" class="hidden" readonly type="text" value={manager.id} />
                {/each}
            </div>
            {#if page.form?.errors?.managers}
                <p class="unstyled text-error-500-400-token text-xs">{page.form.errors.managers[0]}</p>
            {/if}
        </fieldset>

        <div class="col-span-full">
            <div class="flex flex-col space-y-2">
                <span>{$t("wishes.preview")}</span>
                <ListCard hideCount {list} preventNavigate />
            </div>
        </div>
    </div>

    <div class="flex flex-row flex-wrap justify-between gap-4">
        <button class="variant-ghost-secondary btn w-min" onclick={() => history.back()} type="button">
            {$t("general.cancel")}
        </button>
        <div class="flex flex-row gap-x-4">
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
