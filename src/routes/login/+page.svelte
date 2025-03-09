<script lang="ts">
    import { enhance } from "$app/forms";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import type { ActionData, PageServerData } from "./$types";
    import { t } from "svelte-i18n";

    interface Props {
        data: PageServerData;
        form: ActionData;
    }

    let { data, form }: Props = $props();
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("auth.sign-in")}</h1>

    <form
        class="w-80"
        method="POST"
        use:enhance={(form) => {
            return async ({ result, update }) => {
                if (result.type === "failure") {
                    form.formElement.reset();
                }
                await update();
            };
        }}
    >
        <div class="bg-surface-100-800-token ring-outline-token rounded-container-token flex flex-col space-y-4 p-4">
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
                    <button class="variant-filled-primary btn w-min">{$t("auth.log-in")}</button>
                    {#if data.enableSignup}
                        <a href="/signup">{$t("auth.create-an-account")}</a>
                    {/if}
                </div>

                <div>
                    <a class="absolute top-0 right-0 text-sm" href="/forgot-password">{$t("auth.forgot-password")}</a>
                </div>
            </div>
        </div>
    </form>
</div>

<svelte:head>
    <title>{$t("auth.log-in")}</title>
</svelte:head>
