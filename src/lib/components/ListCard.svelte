<script lang="ts">
    import type { List, User } from "@prisma/client";
    import Avatar from "./Avatar.svelte";
    import { t } from "svelte-i18n";

    interface ListWithCounts extends Pick<List, "id" | "name" | "icon" | "iconColor"> {
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

    let { hideCount = false, hasNewItems = false, list, preventNavigate = false }: Props = $props();

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

<svelte:element this={elementTag} bind:this={element} class="card">
    {#if list.unapprovedCount && list.unapprovedCount > 0}
        <div
            class="variant-ghost-primary card-header flex flex-row items-center space-x-2 px-4 py-2 rounded-tl-container-token rounded-tr-container-token"
        >
            <iconify-icon class="text-xl" icon="ion:information-circle"></iconify-icon>
            <p class="text-sm">
                {$t("wishes.approvals-waiting", { values: { approvalCount: list.unapprovedCount } })}
            </p>
        </div>
    {/if}

    <div class="grid grid-cols-[auto_1fr] items-center gap-4 p-4">
        <div style="background-color: {iconColor};" class="avatar" class:bg-primary-400-500-token={!iconColor}>
            <iconify-icon icon={"ion:" + (list.icon ?? "gift")} width="1.5rem"></iconify-icon>
        </div>
        <div class="flex flex-col space-y-1">
            <span class="text-primary-700-200-token text-2xl font-bold md:text-4xl">{listName}</span>
            <div class="flex flex-row items-center space-x-2 text-lg">
                <Avatar user={list.owner} width="w-6" />
                <span class="text-primary-700-200-token">{list.owner.name}</span>
                {#if list.itemCount !== undefined}
                    <span>·</span>
                    <iconify-icon icon="ion:gift"></iconify-icon>
                    <span>
                        {!hideCount ? `${list.claimedCount}/` : ""}{list.itemCount}
                    </span>
                {/if}
                {#if hasNewItems}
                    <iconify-icon
                        class="text-primary-700-200-token opacity-40"
                        icon="ion:ellipse-sharp"
                        width="0.5rem"
                    ></iconify-icon>
                {/if}
            </div>
        </div>
    </div>
</svelte:element>

<style lang="postcss">
    .avatar {
        @apply flex aspect-square w-12 items-center justify-center overflow-hidden rounded-full font-semibold text-surface-50 md:w-16;
    }
</style>
