<script lang="ts">
    import noGroup from "$lib/assets/no_group.svg";
    import { t } from "svelte-i18n";
</script>

<div class="flex flex-col items-center justify-center space-y-4 pt-4">
    <h1 class="h1">{$t("errors.cant-find-your-group")}</h1>
    <img class="w-3/4 pt-4 md:w-1/3" alt={$t("a11y.a-person-looking-at-an-empty-board")} src={noGroup} />
    <p class="text-center">{$t("errors.no-group-friendly-msg")}</p>
</div>
