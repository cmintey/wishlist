<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import type { ActionData, PageServerData } from "./$types";
    import { t } from "svelte-i18n";

    interface Props {
        data: PageServerData;
        form: ActionData;
    }

    let { data, form }: Props = $props();

    const toastStore = getToastStore();
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1 capitalize">{$t("auth.sign-in")}</h1>

    <form
        class="w-80"
        method="POST"
        use:enhance={(form) => {
            return async ({ result, update }) => {
                if (result.type === "failure") {
                    form.formElement.reset();
                } else if (result.type === "error") {
                    toastStore.trigger({
                        background: "variant-filled-error",
                        message: result.error
                    });
                }
                await update();
            };
        }}
    >
        <div class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token">
            <label for="username">
                <span>{$t("auth.username")}</span>
                <input
                    id="username"
                    name="username"
                    class="input"
                    class:input-error={form?.incorrect || form?.error}
                    autocapitalize="off"
                    autocomplete="username"
                    required
                    type="text"
                />
            </label>

            <div class="relative flex flex-col space-y-4">
                <PasswordInput
                    id="password"
                    name="password"
                    error={form?.incorrect || form?.error}
                    label={$t("auth.password")}
                    required
                />

                {#if form?.incorrect}<span class="unstyled text-xs text-red-500">
                        {$t("errors.invalid-credentials")}
                    </span>{/if}
                {#if form?.error}
                    <ul>
                        {#each form.errors as error}
                            <li class="text-xs text-red-500">{error.message}</li>
                        {/each}
                    </ul>
                {/if}

                <div class="flex items-center justify-center space-x-4">
                    <button class="variant-filled-primary btn w-min">{$t("auth.sign-in")}</button>
                    {#if data.enableSignup}
                        <a href="/signup">{$t("auth.create-an-account")}</a>
                    {/if}
                </div>

                <a class="absolute right-0 top-0 !mt-0 pt-0.5 text-sm" href="/forgot-password">
                    {$t("auth.forgot-password")}
                </a>
            </div>
            {#await data.oidcEnabled then oidcEnabled}
                {#if oidcEnabled}
                    <div class="flex w-full items-center justify-center">
                        <hr class="my-2 h-px w-3/4 border-0" />
                        <span class="bg-surface-100-800-token absolute left-1/2 -translate-x-1/2 px-2">
                            {$t("auth.or")}
                        </span>
                    </div>
                    <div class="flex justify-center">
                        <a class="variant-filled-primary btn" href="/login/oidc{page.url.search}">
                            {$t("auth.sign-in-with", { values: { provider: "OAuth" } })}
                        </a>
                    </div>
                {/if}
            {/await}
        </div>
    </form>
</div>

<svelte:head>
    <title>{$t("auth.sign-in")}</title>
</svelte:head>
