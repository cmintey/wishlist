<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import fuzzysort from "fuzzysort";

    interface Props {
        data: Record<string, unknown>[];
        keys: string[];
        result: Record<string, unknown>[];
    }

    let { data, keys, result = $bindable() }: Props = $props();
    const t = getFormatter();

    let search = $state("");

    $effect(() => {
        result = fuzzysort
            .go(search, data, {
                keys,
                all: true
            })
            .map((result) => result.obj);
    });
</script>

<label class="w-fit">
    <span>{$t("general.search")}</span>
    <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="ig-cell preset-tonal">
            <iconify-icon class="text-lg" icon="ion:search"></iconify-icon>
        </div>
        <input class="ig-input" type="search" bind:value={search} />
    </div>
</label>
