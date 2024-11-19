<script lang="ts">
    import Alert from "$lib/components/Alert.svelte";
    import BaseSetting from "./BaseSetting.svelte";

    interface Props {
        mode: ListMode;
        disabled?: boolean;
    }

    let { mode = $bindable(), disabled = false }: Props = $props();
</script>

<BaseSetting title="Wishlist Mode">
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
</BaseSetting>
