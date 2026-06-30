<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import CreateAccountForm from "$lib/components/CreateAccountForm.svelte";
    import type { Props } from "./steps";
    import { getFormatter } from "$lib/i18n";
    import StepButtons from "./StepButtons.svelte";

    const { onSuccess }: Props = $props();
    const t = getFormatter();
    const formId = "create-account-form";

    let submitting = $state(false);
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("setup.create-your-account")}</h1>
    <span>{$t("setup.first-account-admin")}</span>
    <form
        id={formId}
        class="w-80 max-w-lg md:w-2/3 lg:w-1/2 xl:w-2/5"
        action="/signup"
        method="POST"
        use:enhance={() => {
            submitting = true;
            return async ({ result }) => {
                submitting = false;
                await applyAction(result);
                if (result.type === "success" && result.data?.success) {
                    onSuccess();
                }
            };
        }}
    >
        <CreateAccountForm hideActions />
    </form>
</div>

<StepButtons nextButton={{ form: formId, type: "submit" }} {submitting} />
