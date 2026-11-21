<script lang="ts">
    import SettingsGroup from "../SettingsGroup.svelte";
    import Setting from "../Setting.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Pick<Config, "defaultCurrency">;
        envManagedKeys?: string[];
    }

    const { config, envManagedKeys = [] }: Props = $props();
    const t = getFormatter();

    const currencies = Intl.supportedValuesOf("currency");
    const locked = $derived(envManagedKeys.includes("defaultCurrency"));
</script>

<SettingsGroup title={$t("admin.currency")}>
    <Setting>
        <label class="label flex flex-col" for="defaultCurrency">
            <span>{$t("admin.default-currency")}</span>
            <select
                id="defaultCurrency"
                name="defaultCurrency"
                class="select w-full max-w-fit"
                data-testid="default-currency"
                disabled={locked}
                value={config.defaultCurrency}
            >
                {#each currencies as currency}
                    <option value={currency}>{currency}</option>
                {/each}
            </select>
        </label>

        {#snippet description()}
            {locked ? $t("admin.default-currency-env-managed") : $t("admin.default-currency-tooltip")}
        {/snippet}
    </Setting>
</SettingsGroup>
