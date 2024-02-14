<script lang="ts">
    import { page } from "$app/stores";
    import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";

    const config: Config = $page.data.config;
</script>

<SettingsForm {config} />
