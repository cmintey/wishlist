<script lang="ts">
    import { defaultLang, getFormatter, getLocale } from "$lib/i18n";
    import { getDateFormatter } from "svelte-i18n";

    const t = getFormatter();
    const date = getDateFormatter({
        locale: getLocale() || defaultLang.code,
        format: "medium"
    });
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
            values: { buildDate: builtAt ? date.format(builtAt) : $t("admin.unknown") }
        })}
    </span>
</div>
