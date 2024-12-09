<script lang="ts">
    import fuzzysort from "fuzzysort";
    import { t } from "svelte-i18n";

    interface Props {
        data: Record<string, unknown>[];
        keys: string[];
        result: typeof data;
    }

    let { data, keys, result = $bindable() }: Props = $props();
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
        <div class="input-group-shim">
            <iconify-icon class="text-lg" icon="ion:search"></iconify-icon>
        </div>
        <input class="input" type="search" bind:value={search} />
    </div>
</label>
