<script lang="ts">
    import { resolve } from "$app/paths";

    let url = $state();
    let html = $state();

    let result = $state();

    const fetchMetadata = async () => {
        result = "Loading...";
        const resp = await fetch(resolve("/api/product/debug"), {
            method: "POST",
            body: JSON.stringify({ url, html })
        });

        const j = await resp.json();
        console.log(j);
        result = JSON.stringify(j, undefined, 4);
    };
</script>

<div class="flex flex-col gap-2">
    <label class="label">
        <span>URL</span>
        <input class="input w-full" type="text" bind:value={url} />
    </label>

    <label class="label">
        <span>HTML</span>
        <textarea class="textarea w-full" rows="15" bind:value={html}></textarea>
    </label>

    <div class="flex flex-col items-end">
        <button class="btn preset-filled-primary-500" type="button" onclick={fetchMetadata}>Go</button>
    </div>

    <div class="flex flex-col gap-1">
        <span>Output</span>
        <pre class="pre">{result || "No data"}</pre>
    </div>
</div>
