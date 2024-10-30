<script lang="ts">
    interface Props {
        enabled: boolean;
    }

    let { enabled = $bindable() }: Props = $props();
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">Public Signup</h2>
    <label class="unstyled flex flex-row space-x-2">
        <input id="enableSignup" name="enableSignup" class="checkbox" type="checkbox" bind:checked={enabled} />
        <span>Enable</span>
    </label>
</div>
