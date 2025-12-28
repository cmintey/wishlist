<script lang="ts">
    import type { List, User } from "$lib/generated/prisma/client";
    import Avatar from "./Avatar.svelte";
    import { getFormatter } from "$lib/i18n";

    interface ListWithCounts extends Partial<Pick<List, "id" | "name" | "icon" | "iconColor">> {
        owner: Pick<User, "name" | "username" | "picture">;
        itemCount?: number;
        claimedCount?: number;
        unapprovedCount?: number;
    }

    interface Props {
        hideCount?: boolean;
        list: ListWithCounts;
        hasNewItems?: boolean;
        preventNavigate?: boolean;
    }

    const { hideCount = false, hasNewItems = false, list, preventNavigate = false }: Props = $props();
    const t = getFormatter();

    let listName = $derived(list.name || $t("wishes.wishes-for", { values: { listOwner: list.owner.name } }));
    let iconColor = $derived(list.iconColor);
    let elementTag = $derived(preventNavigate ? "div" : "a");
    let element: HTMLElement | undefined = $state();

    $effect(() => {
        if (element && !preventNavigate) {
            (element as unknown as HTMLLinkElement).href = `/lists/${list.id}`;
        }
    });
</script>

<svelte:element
    this={elementTag}
    bind:this={element}
    class={["card preset-filled-surface-100-900", !preventNavigate && "card-hover"]}
>
    {#if list.unapprovedCount && list.unapprovedCount > 0}
        <div
            class="preset-tonal-primary border-primary-500 rounded-tl-container rounded-tr-container flex flex-row items-center gap-x-2 border px-4 py-1"
        >
            <iconify-icon class="text-xl" icon="ion:information-circle"></iconify-icon>
            <p class="text-sm">
                {$t("wishes.approvals-waiting", { values: { approvalCount: list.unapprovedCount } })}
            </p>
        </div>
    {/if}

    <div class="grid grid-cols-[auto_1fr] items-center gap-4 p-4">
        <div
            style="background-color: {iconColor};"
            class="text-surface-50 flex aspect-square w-12 items-center justify-center overflow-hidden rounded-full font-semibold md:w-16"
            class:bg-primary-500={!iconColor}
        >
            <iconify-icon icon={"ion:" + (list.icon ?? "gift")} width="1.5rem"></iconify-icon>
        </div>
        <div class="flex flex-col space-y-1">
            <span class="text-primary-800-200 line-clamp-2 text-2xl font-bold md:text-4xl" data-testid="list-name">
                {listName}
            </span>
            <div class="flex flex-row flex-wrap items-center gap-2 text-lg">
                <div class="flex flex-row items-center gap-2">
                    <Avatar class="size-6" user={list.owner} />
                    <span class="text-primary-800-200" data-testid="list-owner">{list.owner.name}</span>
                </div>

                {#if list.itemCount !== undefined}
                    <span>·</span>
                    <div class="flex flex-row items-center gap-x-2">
                        <iconify-icon icon="ion:gift"></iconify-icon>
                        <span data-testid="item-count">
                            {!hideCount ? `${list.claimedCount}/` : ""}{list.itemCount}
                        </span>
                        {#if hasNewItems}
                            <iconify-icon
                                class="text-primary-800-200 opacity-40"
                                icon="ion:ellipse-sharp"
                                width="0.5rem"
                            ></iconify-icon>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</svelte:element>
