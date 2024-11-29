<script lang="ts">
    import { enhance } from "$app/forms";
    import SmtpAlert from "$lib/components/admin/SMTPAlert.svelte";
    import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    let config = $state(data.config);
    let groups = $state(data.groups);
    let sending = $state(false);
    let saved = $state(false);
    let sent = $state(false);
</script>

<SmtpAlert smtpEnable={data.config.smtp.enable} />

<form
    action="/admin/settings?/settings"
    method="POST"
    use:enhance={({ action }) => {
        if (action.search.endsWith("?/send-test")) {
            sending = true;
        }
        return ({ action, result }) => {
            if (action.search.endsWith("?/settings") && result.type === "success") {
                saved = true;
            }
            if (action.search.endsWith("?/send-test") && result.type === "success") {
                sending = false;
                sent = true;
            }
        };
    }}
>
    <SettingsForm {config} {groups} {saved} {sending} {sent} />
</form>
