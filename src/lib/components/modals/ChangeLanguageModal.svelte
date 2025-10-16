<script lang="ts">
    import { enhance } from "$app/forms";
    import { getFormatter, supportedLangs } from "$lib/i18n";

    interface Props {
        parent: any;
    }

    const { parent }: Props = $props();
    const t = getFormatter();
    const modalStore = getModalStore();
    const currentLanguage = $modalStore[0].meta?.currentLanguage || "";

    let error = $state(false);
</script>

<form
    class="card w-modal space-y-4 p-4 shadow-xl"
    action="/?/language"
    method="POST"
    use:enhance={() => {
        return async ({ result, update }) => {
            if (result.type === "success") {
                modalStore.close();
                window.location.reload();
            } else if (result.type === "failure") {
                error = true;
                return update();
            } else {
                modalStore.close();
                return update();
            }
        };
    }}
>
    <header class="text-2xl font-bold">{$t("general.choose-a-language")}</header>
    <p>
        {$t("general.choose-language-description")}
    </p>
    <label for="language">
        <span>{$t("general.language")}</span>
        <select id="language" name="language" class="select" value={currentLanguage}>
            <option value="">{$t("general.use-system-language")}</option>
            {#each supportedLangs as lang}
                {#if !lang.hidden}
                    <option value={lang.code}>{lang.endonym} ({lang.name})</option>
                {/if}
            {/each}
        </select>
        {#if error}
            <p class="text-error-500">{$t("errors.language-is-required")}</p>
        {/if}
    </label>
    <p class="subtext">
        {@html $t("general.dont-see-language", {
            values: { href: "https://github.com/cmintey/wishlist/tree/main?tab=readme-ov-file#translations" }
        })}
    </p>

    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" onclick={parent.onClose} type="button">
            {parent.buttonTextCancel}
        </button>
        <button class="btn {parent.buttonPositive}" type="submit">{$t("general.save")}</button>
    </footer>
</form>
