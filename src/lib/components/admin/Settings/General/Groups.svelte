<script lang="ts">
    import type { Group } from "@prisma/client";
    import SettingsGroup from "../SettingsGroup.svelte";
    import Setting from "../Setting.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<Config, "defaultGroup">;
        groups: Group[];
    }

    const { config, groups }: Props = $props();
    const t = getFormatter();
</script>

<SettingsGroup>
    <h3 class="h3">{$t("admin.groups")}</h3>
    <Setting>
        <label class="flex flex-col" for="defaultGroup">
            <span>{$t("admin.default-group")}</span>
            <select
                id="defaultGroup"
                name="defaultGroup"
                class="select w-fit min-w-64"
                value={config.defaultGroup || ""}
            >
                <option value="">{$t("admin.select-a-group-option")}</option>
                {#each groups as group}
                    <option value={group.id}>{group.name}</option>
                {/each}
            </select>
        </label>

        {#snippet description()}
            {$t("admin.default-group-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
