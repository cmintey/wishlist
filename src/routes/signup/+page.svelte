<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import CreateAccountForm from "$lib/components/CreateAccountForm.svelte";
    import { getFormatter } from "$lib/i18n";

    const { data }: PageProps = $props();
    const t = getFormatter();

    onMount(() => {
        if (data.valid) window.history.replaceState({}, "", "/signup");
    });

    let signingIn = $state(false);
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1 capitalize">{$t("auth.create-account")}</h1>

    <form
        class="min-w-80 max-w-lg md:w-1/2 lg:w-2/3"
        method="POST"
        use:enhance={() => {
            signingIn = true;
            return async ({ update }) => {
                signingIn = false;
                return update();
            };
        }}
    >
        <CreateAccountForm {signingIn} />
    </form>
</div>

<svelte:head>
    <title>{$t("auth.create-an-account")}</title>
</svelte:head>
