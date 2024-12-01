<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";

    interface Props {
        enabled: boolean;
    }

    let { enabled = $bindable() }: Props = $props();
</script>

<BaseSetting title="Public Signup">
    <label class="unstyled flex flex-row space-x-2">
        <input id="enableSignup" name="enableSignup" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>Enable</span>
    </label>
</BaseSetting>
