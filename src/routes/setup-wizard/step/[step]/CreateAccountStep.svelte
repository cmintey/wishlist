<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import CreateAccountForm from "$lib/components/CreateAccountForm.svelte";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import type { Props } from "./steps";

    let { onSuccess }: Props = $props();

    let form: HTMLFormElement | undefined = $state();

    const submit: Writable<() => void> = getContext("submit");
    $submit = () => {
        form?.requestSubmit();
    };
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">Create your account</h1>
    <span>Your first account will be the administrator. You can always add more admins later.</span>
    <form
        bind:this={form}
        class="w-80 md:w-1/3"
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
