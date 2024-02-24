<script lang="ts">
    import { enhance } from "$app/forms";
    import SmtpAlert from "$lib/components/admin/SMTPAlert.svelte";
    import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    let sending = false;
    let saved = false;
    let sent = false;
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
    <SettingsForm config={data.config} {saved} {sending} {sent} />
</form>
