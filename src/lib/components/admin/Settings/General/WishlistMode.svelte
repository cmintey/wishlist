<script lang="ts">
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { getFormatter } from "$lib/i18n";
    import Setting from "../Setting.svelte";
    import SettingsGroup from "../SettingsGroup.svelte";

    interface Props {
        config: Pick<Config, "listMode">;
        groupUserCount: number;
        listCount: number;
    }

    const { config, groupUserCount, listCount }: Props = $props();
    const t = getFormatter();
</script>

<SettingsGroup title={$t("admin.wishlist-mode")}>
    <Setting>
        {@const disabled = groupUserCount > 1 || listCount > 1}
        <label class="flex flex-col" for="listMode">
            <Tooltip>
                {#snippet label()}
                    <span>{$t("admin.wishlist-mode")}</span>
                {/snippet}
                {#snippet description()}
                    <div>
                        <ul class="list">
                            <li>
                                <div>
                                    <p class="font-bold">{$t("admin.wishlist-mode-wishlist")}</p>
                                    <p>{$t("admin.wishlist-mode-wishlist-tooltip")}</p>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <p class="font-bold">{$t("admin.wishlist-mode-registry")}</p>
                                    <p>{$t("admin.wishlist-mode-registry-tooltip")}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                {/snippet}
            </Tooltip>
            <select id="listMode" name="listMode" class="select w-fit min-w-64" bind:value={config.listMode}>
                <option value="standard">{$t("admin.wishlist-mode-wishlist")}</option>
                <option {disabled} value="registry">{$t("admin.wishlist-mode-registry")}</option>
            </select>
        </label>
        {#if disabled}
            <div class="flex flex-row items-center gap-x-1">
                <iconify-icon class="text-warning-800 dark:text-warning-500" icon="ion:warning"></iconify-icon>
                <span class="text-sm text-warning-800 dark:text-warning-500">
                    {$t("admin.wishlist-mode-alert", { values: { memberCount: groupUserCount, listCount: listCount } })}
                </span>
            </div>
        {/if}
    </Setting>
</SettingsGroup>
