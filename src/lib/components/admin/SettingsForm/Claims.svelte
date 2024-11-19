<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";

    interface Props {
        enabled: boolean;
    }

    let { enabled = $bindable() }: Props = $props();
</script>

<BaseSetting title="Claims">
    <label class="unstyled flex flex-row space-x-2">
        <input id="claimsShowName" name="claimsShowName" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>Show Name</span>
    </label>
</BaseSetting>
