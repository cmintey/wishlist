<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import CreateAccountForm from "$lib/components/CreateAccountForm.svelte";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import type { Props } from "./steps";
    import { getFormatter } from "$lib/i18n";

    const { onSuccess }: Props = $props();
    const t = getFormatter();

    let form: HTMLFormElement | undefined = $state();

    const submit: Writable<() => void> = getContext("submit");
    $submit = () => {
        form?.requestSubmit();
    };
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("setup.create-your-account")}</h1>
    <span>{$t("setup.first-account-admin")}</span>
    <form
        bind:this={form}
        class="w-80 max-w-lg md:w-2/3 lg:w-1/2 xl:w-2/5"
        action="/signup"
        method="POST"
        use:enhance={() => {
            return async ({ result }) => {
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
