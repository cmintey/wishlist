<script lang="ts" module>
    export interface PartialUser extends Pick<User, "id" | "name"> {
        activeGroupId: string;
    }

    type ItemVoidFunction = (itemId: number) => void;

    export interface ItemCardProps {
        item: ItemOnListDTO;
        user: PartialUser | undefined; // logged in user
        userCanManage?: boolean;
        showClaimedName: boolean;
        showClaimForOwner?: boolean;
        requireClaimEmail: boolean;
        groupId: string;
        showFor?: boolean;
        onPublicList?: boolean;
        reorderActions?: boolean;
        onIncreasePriority?: ItemVoidFunction;
        onDecreasePriority?: ItemVoidFunction;
        onPriorityChange?: (item: ItemOnListDTO, idx: string) => void;
        isTileView?: boolean;
    }

    export interface InternalItemCardProps {
        id: string;
        item: ItemOnListDTO;
        user: PartialUser | undefined;
        userCanManage: boolean;
        showClaimedName: boolean;
        showClaimForOwner: boolean;
        requireClaimEmail: boolean;
        groupId: string;
        showFor: boolean;
        onPublicList: boolean;
        reorderActions: boolean;
        onIncreasePriority?: ItemVoidFunction;
        onDecreasePriority?: ItemVoidFunction;
        onPriorityChange?: (item: ItemOnListDTO, idx: string) => void;
        defaultImage: Snippet<[MessageFormatter, classes?: ClassValue]>;
    }
</script>

<script lang="ts">
    import type { User } from "$lib/generated/prisma/client";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import type { ClassValue } from "svelte/elements";
    import type { MessageFormatter } from "$lib/server/i18n";
    import GridItemCard from "./GridItemCard.svelte";
    import ListItemCard from "./ListItemCard.svelte";
    import type { Snippet } from "svelte";
    import ItemDrawer from "../ItemDrawer.svelte";

    const {
        item,
        groupId,
        user = undefined,
        userCanManage = false,
        showClaimedName = false,
        showClaimForOwner = false,
        requireClaimEmail = true,
        showFor = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority = undefined,
        onDecreasePriority = undefined,
        onPriorityChange,
        isTileView = false
    }: ItemCardProps = $props();

    const id = $props.id();

    let drawerOpen = $state(false);

    $effect(() => {
        if (page.url.searchParams.get("item-id") === item.id.toString()) {
            openDrawer();
        }
    });

    function launchDrawer() {
        goto(`?item-id=${item.id}`, { replaceState: true, noScroll: true });
    }

    function openDrawer() {
        drawerOpen = true;
    }

    const ItemCard = $derived(isTileView ? GridItemCard : ListItemCard);
</script>

{#snippet defaultImage(t: MessageFormatter, sizeClasses: ClassValue = ["w-24", "h-24", "md:w-40", "md:h-40"])}
    <div
        class={["bg-surface-300-700 grid flex-none place-items-center", sizeClasses]}
        aria-label={t("a11y.default-item-image")}
        data-testid="image"
        role="img"
    >
        <iconify-icon class="size-8 md:size-16" height="none" icon="ion:gift"></iconify-icon>
    </div>
{/snippet}

<ItemDrawer
    {id}
    {defaultImage}
    {groupId}
    {item}
    {onDecreasePriority}
    {onIncreasePriority}
    {onPriorityChange}
    {onPublicList}
    {reorderActions}
    {requireClaimEmail}
    {showClaimForOwner}
    {showClaimedName}
    {showFor}
    {user}
    {userCanManage}
    bind:open={drawerOpen}
/>

<div
    class={[
        "card preset-filled-surface-100-900 block h-full w-full text-start",
        !item.approved && "preset-tonal-warning border-warning-500 border",
        !reorderActions && "card-hover"
    ]}
    aria-labelledby={`${id}-name`}
    onclick={() => {
        if (!reorderActions) launchDrawer();
    }}
    onkeyup={(e) => {
        if (!reorderActions && e.key === "Enter") launchDrawer();
    }}
    role={reorderActions ? "none" : "button"}
>
    <ItemCard
        {id}
        {defaultImage}
        {groupId}
        {item}
        {onDecreasePriority}
        {onIncreasePriority}
        {onPriorityChange}
        {onPublicList}
        {reorderActions}
        {requireClaimEmail}
        {showClaimForOwner}
        {showClaimedName}
        {showFor}
        {user}
        {userCanManage}
    />
</div>
