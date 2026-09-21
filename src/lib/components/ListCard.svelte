<script lang="ts">
    import type { List, User } from "$lib/generated/prisma/client";
    import { Progress } from "@skeletonlabs/skeleton-svelte";
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
        hideOwner?: boolean;
        list: ListWithCounts;
        hasNewItems?: boolean;
        preventNavigate?: boolean;
    }

    const {
        hideCount = false,
        hideOwner = false,
        hasNewItems = false,
        list,
        preventNavigate = false
    }: Props = $props();
    const t = getFormatter();

    let listName = $derived(list.name || $t("wishes.wishes-for", { values: { listOwner: list.owner.name } }));
    let availableCount = $derived((list.itemCount ?? 0) - (list.claimedCount ?? 0));
    let claimedPercent = $derived(
        list.itemCount && list.itemCount > 0
            ? Math.min(100, Math.round(((list.claimedCount ?? 0) / list.itemCount) * 100))
            : 0
    );
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
    class={[
        "card preset-filled-surface-100-900 inset-ring-surface-200-800 inset-ring",
        !preventNavigate && "card-hover"
    ]}
>
    {#if list.unapprovedCount && list.unapprovedCount > 0}
        <div
            class="preset-tonal-primary border-primary-500 rounded-tl-container rounded-tr-container flex flex-row items-center gap-x-2 border px-2 py-1"
        >
            <iconify-icon class="text-lg" icon="ion:information-circle"></iconify-icon>
            <p class="text-sm">
                {$t("wishes.approvals-waiting", { values: { approvalCount: list.unapprovedCount } })}
            </p>
        </div>
    {/if}

    <div class="grid grid-cols-[auto_1fr] items-center gap-4 p-4">
        <div
            style="background-color: {iconColor};"
            class="text-surface-50 flex aspect-square w-12 items-center justify-center overflow-hidden rounded-full font-semibold md:w-14"
            class:bg-primary-500={!iconColor}
        >
            <iconify-icon class="text-2xl" icon={"ion:" + (list.icon ?? "gift")}></iconify-icon>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-primary-900-100 line-clamp-2 text-xl font-bold" data-testid="list-name">
                {listName}
            </span>
            {#if !hideOwner}
                <div class="grid grid-cols-[1.5rem_auto] items-center gap-2 text-sm md:text-base">
                    <Avatar class="text-tiny size-5 justify-self-center md:size-6" user={list.owner} />
                    <span class="text-surface-800-200" data-testid="list-owner">{list.owner.name}</span>
                </div>
            {/if}
            <div class="contents" data-testid="item-count">
                <div class="grid grid-cols-[1.5rem_auto_1fr] items-center gap-2 text-sm md:text-base">
                    {#if hideCount}
                        <iconify-icon class="justify-self-center" icon="ion:gift"></iconify-icon>
                        <span>{$t("wishes.items-requested", { values: { itemCount: list.itemCount } })}</span>
                    {:else}
                        <Progress class="relative w-fit justify-self-center" value={claimedPercent}>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <iconify-icon
                                    class="flex size-2.5 items-center justify-center"
                                    height="none"
                                    icon="ion:gift"
                                    width="none"
                                ></iconify-icon>
                            </div>
                            <Progress.Circle
                                class="[--size:--spacing(5)] [--thickness:calc(var(--size)/8)] md:[--size:--spacing(6)]"
                            >
                                <Progress.CircleTrack />
                                <Progress.CircleRange />
                            </Progress.Circle>
                        </Progress>
                        <span class="font-bold">{$t("wishes.items-available", { values: { availableCount } })}</span>
                    {/if}

                    {#if hasNewItems}
                        <iconify-icon
                            class="text-primary-800-200 flex size-2 justify-center opacity-40"
                            height="none"
                            icon="ion:ellipse-sharp"
                            width="none"
                        ></iconify-icon>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</svelte:element>
