<script lang="ts">
    import fuzzysort from "fuzzysort";

    interface Props {
        data: Record<string, unknown>[];
        keys: string[];
        result: typeof data;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <span>Search</span>
    <div class="input-group grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim">
            <iconify-icon class="text-lg" icon="ion:search"></iconify-icon>
        </div>
        <input class="input" type="search" bind:value={search} />
    </div>
</label>
