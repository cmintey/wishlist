<script lang="ts">
    import { enhance } from "$app/forms";
    import { getFormatter, supportedLangs } from "$lib/i18n";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";

    interface Props {
        trigger: BaseModalProps["trigger"];
        currentLanguage?: string | null;
    }

    const { trigger, currentLanguage }: Props = $props();
    const t = getFormatter();
    const formId = $props.id();

    let open = $state(false);
    let error = $state(false);
</script>

<BaseModal onOpenChange={(e) => (open = e.open)} {open} title={$t("general.choose-a-language")} {trigger}>
    {#snippet description()}
        <p>{$t("general.choose-language-description")}</p>
    {/snippet}

    {#snippet actions()}
        <div class="flex justify-between">
            <Dialog.CloseTrigger class="preset-tonal btn btn-sm md:btn-base inset-ring" type="button">
                {$t("general.cancel")}
            </Dialog.CloseTrigger>

            <Dialog.CloseTrigger class="preset-filled btn btn-sm md:btn-base" form={formId} type="submit">
                {$t("general.save")}
            </Dialog.CloseTrigger>
        </div>
    {/snippet}

    <form
        id={formId}
        action="/?/language"
        method="POST"
        use:enhance={(e) => {
            console.log(e);
            return async ({ result, update }) => {
                console.log(result);
                if (result.type === "success") {
                    open = false;
                    window.location.reload();
                } else if (result.type === "failure") {
                    error = true;
                    open = true;
                    return update();
                } else {
                    return update();
                }
            };
        }}
    >
        <label class="label" for="language">
            <span>{$t("general.language")}</span>
            <select id="language" name="language" class="select" value={currentLanguage || ""}>
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
        <p class="subtext pt-2">
            {@html $t("general.dont-see-language", {
                values: {
                    href: "https://github.com/cmintey/wishlist/tree/main?tab=readme-ov-file#translations",
                    class: "anchor"
                }
            })}
        </p>
    </form>
</BaseModal>
