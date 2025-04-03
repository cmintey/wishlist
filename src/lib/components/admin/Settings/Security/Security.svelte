<script lang="ts">
    import Oidc from "./OIDC.svelte";
    import Credentials from "./Credentials.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        config: Pick<Config, "oidc" | "security" | "enableSignup">;
        hidden?: boolean;
    }

    const { config, hidden = false }: Props = $props();
</script>

<div class={{ hidden, "flex flex-col gap-4": !hidden }}>
    <h2 class="h2">{$t("admin.security")}</h2>
    <Credentials {config} />
    <Oidc {config} />
</div>
