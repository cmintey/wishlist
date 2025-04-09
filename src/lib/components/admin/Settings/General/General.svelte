<script lang="ts">
    import type { Group } from "@prisma/client";
    import WishlistMode from "./WishlistMode.svelte";
    import Suggestions from "./Suggestions.svelte";
    import Claims from "./Claims.svelte";
    import Lists from "./Lists.svelte";
    import Groups from "./Groups.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<
            Config,
            "claims" | "defaultGroup" | "suggestions" | "enableDefaultListCreation" | "listMode" | "allowPublicLists"
        >;
        groups: Group[];
        hidden?: boolean;
        forGroup?: boolean;
        groupUserCount?: number;
    }

    const { config, groups, hidden = false, forGroup = false, groupUserCount = 0 }: Props = $props();
    const t = getFormatter();
</script>

<div class={{ hidden, "flex flex-col gap-4": !hidden }}>
    <h2 class="h2">{$t("admin.general")}</h2>

    {#if forGroup}
        <WishlistMode {config} {groupUserCount} />
    {/if}

    <Suggestions {config} />

    <Claims {config} />

    <Lists {config} />

    {#if !forGroup}
        <Groups {config} {groups} />
    {/if}
</div>
