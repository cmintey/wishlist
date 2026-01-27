<script lang="ts">
    import { defaultLang, getFormatter, getLocale } from "$lib/i18n";
    import { getDateFormatter } from "svelte-i18n";

    const t = getFormatter();
    const date = getDateFormatter({
        locale: getLocale() || defaultLang.code,
        format: "medium"
    });

    const version: string = $state(__VERSION__ || $t("admin.dev"));
    const sha: string = $state(__COMMIT_SHA__ || $t("admin.dev"));
    const builtAt: Date = new Date(__LASTMOD__);
    const versionHref: string = $derived(`https://github.com/cmintey/wishlist/releases/tag/${version}`);
    const shaHref: string = $derived(`https://github.com/cmintey/wishlist/commit/${sha}`);
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">Wishlist</h2>
    <span>
        {@html $t("admin.version", { values: { version, href: versionHref, class: "anchor" } })}
    </span>
    <span>
        {@html $t("admin.build", { values: { sha: sha ? sha : $t("admin.dev"), href: shaHref, class: "anchor" } })}
    </span>
    <span>
        {$t("admin.build-date", {
            values: { buildDate: builtAt ? date.format(builtAt) : $t("admin.unknown") }
        })}
    </span>
</div>
