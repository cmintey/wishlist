<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import { page } from "$app/stores";
    import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import type { Props } from "./steps";
    import type { Group } from "@prisma/client";
    import { t } from "svelte-i18n";

    let { onSuccess }: Props = $props();

    let config: Config = $state($page.data.config);
    let groups: Group[] = $state($page.data.groups);
    let form: HTMLFormElement | undefined = $state();
    let sending = $state(false);
    let saved = $state(false);
    let sent = $state(false);

    const submit: Writable<() => void> = getContext("submit");
    $submit = () => {
        form?.requestSubmit();
    };
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("setup.global-settings")}</h1>
    <span>{$t("setup.global-settings-subtext")}</span>
    <div class="bg-surface-100-800-token ring-outline-token rounded-container-token p-4">
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
                    if (result.type === "success" && result.data?.success) {
                        onSuccess();
                    }
                };
            }}
        >
            <SettingsForm {config} {groups} hideActions {saved} {sending} {sent} />
        </form>
    </div>
</div>
