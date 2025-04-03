<script lang="ts">
    import Alert from "$lib/components/Alert.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { t } from "svelte-i18n";
    import Setting from "../Setting.svelte";
    import SettingsGroup from "../SettingsGroup.svelte";

    interface Props {
        config: Pick<Config, "listMode">;
        groupUserCount: number;
    }

    const { config, groupUserCount }: Props = $props();
</script>

<SettingsGroup>
    <h3 class="h3">{$t("admin.wishlist-mode")}</h3>
    <Setting>
        {@const disabled = groupUserCount > 1}

        {#if disabled}
            <Alert type="info">{$t("admin.wishlist-mode-alert")}</Alert>
        {/if}

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
                {#if !disabled}
                    <option value="registry">{$t("admin.wishlist-mode-registry")}</option>
                {/if}
            </select>
        </label>
    </Setting>
</SettingsGroup>
