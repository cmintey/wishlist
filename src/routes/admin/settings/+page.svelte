<script lang="ts">
	import SmtpAlert from "$lib/components/admin/SMTPAlert.svelte";
	import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<SmtpAlert smtpEnable={data.config.smtp.enable} />
<SettingsForm config={data.config} />
