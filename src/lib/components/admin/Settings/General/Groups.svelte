<script lang="ts">
    import type { Group } from "$lib/generated/prisma/client";
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

<SettingsGroup title={$t("admin.groups")}>
    <Setting>
        <label class="label flex flex-col" for="defaultGroup">
            <span>{$t("admin.default-group")}</span>
            <select
                id="defaultGroup"
                name="defaultGroup"
                class="select w-full max-w-fit"
                value={config.defaultGroup || ""}
            >
                <option class="truncate" value="">{$t("admin.select-a-group-option")}</option>
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
