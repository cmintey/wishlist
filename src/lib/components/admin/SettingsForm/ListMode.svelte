<script lang="ts">
    import Alert from "$lib/components/Alert.svelte";

    export let mode: ListMode;
    export let disabled = false;
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">Wishlist Mode</h2>
    {#if disabled}
        <Alert type="info">
            There are other members in this group, you cannot switch the mode until you remove all but one member.
        </Alert>
    {/if}
    <select id="listMode" name="listMode" class="select w-fit min-w-64" bind:value={mode}>
        <option value="standard">Wishlist</option>
        {#if !disabled}
            <option value="registry">Registry</option>
        {/if}
    </select>
</div>
