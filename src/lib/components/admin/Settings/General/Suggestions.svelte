<script lang="ts">
    import Tooltip from "$lib/components/Tooltip.svelte";
    import SettingsGroup from "../SettingsGroup.svelte";
    import Setting from "../Setting.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<Config, "suggestions">;
    }

    const { config }: Props = $props();
    const t = getFormatter();
</script>

<SettingsGroup title={$t("admin.suggestions")}>
    <Setting>
        <label class="checkbox-label">
            <input
                id="enableSuggestions"
                name="enableSuggestions"
                class="checkbox"
                type="checkbox"
                bind:checked={config.suggestions.enable}
            />
            <span>{$t("general.enable")}</span>
        </label>
        {#snippet description()}
            {$t("admin.suggestions-tooltip")}
        {/snippet}
    </Setting>

    {#if config.suggestions.enable}
        <Setting>
            <label class="flex flex-col pb-1" for="suggestionMethod">
                <Tooltip>
                    {#snippet label()}
                        <span>{$t("admin.suggestions-method")}</span>
                    {/snippet}
                    {#snippet description()}
                        <div>
                            <ul class="list">
                                <li>
                                    <div>
                                        <p class="font-bold">{$t("admin.suggestions-surprise-me")}</p>
                                        <p>{$t("admin.suggestions-surprise-me-tooltip")}</p>
                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <p class="font-bold">{$t("admin.suggestions-auto-approve")}</p>
                                        <p>{$t("admin.suggestions-auto-approve-tooltip")}</p>
                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <p class="font-bold">{$t("admin.suggestions-approval-required")}</p>
                                        <p>{$t("admin.suggestions-approval-required-tooltip")}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    {/snippet}
                </Tooltip>

                <select
                    id="suggestionMethod"
                    name="suggestionMethod"
                    class="select w-fit min-w-64"
                    bind:value={config.suggestions.method}
                >
                    <option value="surprise">{$t("admin.suggestions-surprise-me")}</option>
                    <option value="auto-approval">{$t("admin.suggestions-auto-approve")}</option>
                    <option value="approval">{$t("admin.suggestions-approval-required")}</option>
                </select>
            </label>
        </Setting>
    {/if}
</SettingsGroup>
