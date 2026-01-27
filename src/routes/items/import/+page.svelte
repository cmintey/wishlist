<script lang="ts">
    import { enhance } from "$app/forms";
    import { getFormatter } from "$lib/i18n";
    import type { PageProps } from "./$types";

    const props: PageProps = $props();
    const t = getFormatter();

    let data = $derived(props.data);
    let form = $derived(props.form);

    let currentGroup = $state(props.data.groups?.find((group) => group.active));
    let selectedGroupId: string | undefined = $state(currentGroup?.id);
    let lists = $derived(data.lists.filter((list) => list.groupId === selectedGroupId));
</script>

<div class="flex w-full flex-col items-center">
    <form class="card flex w-2/3 flex-col gap-4 p-4" method="POST" use:enhance>
        {#if !data.url}
            <div class="flex flex-col gap-2">
                <h2 class="h2">{$t("wishes.import-error-title")}</h2>
                <span>{$t("wishes.import-error-text")}</span>
            </div>
        {:else}
            <div>
                <h2 class="h2">{$t("wishes.import-item")}</h2>
                <span>{$t("wishes.import-item-text")}</span>
            </div>

            <div class="flex flex-col gap-2">
                <label class="w-full">
                    <span>{$t("admin.select-a-group-option")}</span>

                    <select
                        name="group"
                        class="select"
                        onchange={(e) => (selectedGroupId = e.currentTarget.value)}
                        required
                        value={currentGroup?.id}
                    >
                        {#each data.groups as group}
                            <option value={group.id}>{group.name}</option>
                        {/each}
                    </select>

                    {#if form?.group}
                        <span class="text-invalid">{form.group}</span>
                    {/if}
                </label>

                <label class="w-full">
                    <span>{$t("wishes.select-a-list")}</span>

                    <select
                        name="list"
                        class="select"
                        disabled={selectedGroupId === undefined || lists.length === 0}
                        required
                    >
                        {#if lists.length === 0}
                            <option value={undefined}>{$t("general.no-lists-available")}</option>
                        {/if}
                        {#each lists as list}
                            {@const listName =
                                list.name || $t("wishes.wishes-for", { values: { listOwner: list.owner.name } })}; }
                            <option value={list.id}>{listName}</option>
                        {/each}
                    </select>

                    {#if form?.list}
                        <span class="text-invalid">{form.list}</span>
                    {/if}
                </label>

                <input name="url" class="hidden" value={data.url} />
            </div>

            <div class="flex flex-row-reverse">
                <button class="variant-filled-primary btn">{$t("general.import")}</button>
            </div>
        {/if}
    </form>
</div>
