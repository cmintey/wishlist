<script lang="ts">
    export let mode: ListMode;
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">Wishlist Mode</h2>
    <select id="listMode" name="listMode" class="select w-fit" bind:value={mode}>
        <option value="standard">Wishlist</option>
        <option value="registry">Registry</option>
    </select>
</div>
