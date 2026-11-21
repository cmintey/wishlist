<script lang="ts">
    import type { Group } from "$lib/generated/prisma/client";
    import WishlistMode from "./WishlistMode.svelte";
    import Suggestions from "./Suggestions.svelte";
    import Claims from "./Claims.svelte";
    import Lists from "./Lists.svelte";
    import Groups from "./Groups.svelte";
    import Currency from "./Currency.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<
            Config,
            | "claims"
            | "defaultGroup"
            | "suggestions"
            | "enableDefaultListCreation"
            | "listMode"
            | "allowPublicLists"
            | "defaultCurrency"
        >;
        groups: Group[];
        hidden?: boolean;
        forGroup?: boolean;
        groupUserCount?: number;
        listCount?: number;
        envManagedKeys?: string[];
    }

    const {
        config,
        groups,
        hidden = false,
        forGroup = false,
        groupUserCount = 0,
        listCount = 0,
        envManagedKeys = []
    }: Props = $props();
    const t = getFormatter();
</script>

<div class={{ hidden, "flex flex-col gap-4": !hidden }}>
    <h2 class="h2">{$t("admin.general")}</h2>

    {#if forGroup}
        <WishlistMode {config} {groupUserCount} {listCount} />
    {/if}

    <Suggestions {config} />

    <Claims {config} />

    <Lists {config} />

    {#if !forGroup}
        <Groups {config} {groups} />

        <Currency {config} {envManagedKeys} />
    {/if}
</div>
