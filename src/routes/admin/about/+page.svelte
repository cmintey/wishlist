<script lang="ts">
    import { t, date } from "svelte-i18n";
    const version: string = __VERSION__;
    const sha: string = __COMMIT_SHA__;
    const builtAt: Date = new Date(__LASTMOD__);
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">Wishlist</h2>
    <span>
        {@html $t("admin.version", { values: { version: version ? version : $t("admin.dev") } })}
    </span>
    <span>
        {@html $t("admin.build", { values: { sha: sha ? sha : $t("admin.dev") } })}
    </span>
    <span>
        {$t("admin.build-date", {
            values: { buildDate: builtAt ? $date(builtAt, { format: "medium" }) : $t("admin.unknown") }
        })}
    </span>
</div>
