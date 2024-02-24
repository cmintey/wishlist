<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import { page } from "$app/stores";
    import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";

    const config: Config = $page.data.config;

    let form: HTMLFormElement;
    const submit: Writable<() => void> = getContext("submit");
    $submit = () => {
        form?.requestSubmit();
    };

    let sending = false;
    let saved = false;
    let sent = false;
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">Global Settings</h1>
    <span>
        These settings will be applied to all groups that are created. Some settings may be overrided by individual
        groups.
    </span>
    <div class="bg-surface-100-800-token ring-outline-token p-4 rounded-container-token">
        <form
            bind:this={form}
            action="/admin/settings?/settings"
            method="POST"
            use:enhance={({ action }) => {
                if (action.search.endsWith("?/send-test")) {
                    sending = true;
                }
                return async ({ action, result }) => {
                    if (action.search.endsWith("?/settings") && result.type === "success") {
                        saved = true;
                    }
                    if (action.search.endsWith("?/send-test") && result.type === "success") {
                        sending = false;
                        sent = true;
                    }

                    await applyAction(result);
                };
            }}
        >
            <SettingsForm {config} hideActions {saved} {sending} {sent} />
        </form>
    </div>
</div>
