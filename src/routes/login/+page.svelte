<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { Progress } from "@skeletonlabs/skeleton-svelte";
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Alert from "$lib/components/Alert.svelte";
    import { getFormatter } from "$lib/i18n";

    const { data, form }: PageProps = $props();
    const t = getFormatter();

    const toastStore = getToastStore();

    let signingIn = $state(false);
    let oAuthError: Record<string, string> | undefined = $state();
    onMount(async () => {
        if (data.isCallback) {
            const resp = await fetch("/login/oidc/callback", {
                method: "POST",
                body: JSON.stringify({ url: page.url })
            });
            if (!resp.ok) {
                oAuthError = await resp.json();
                goto("/login?error=" + (oAuthError?.message || $t("general.oops")));
            } else if (resp.redirected) {
                goto(resp.url, { invalidateAll: true });
            }
        }
    });
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1 capitalize">{$t("auth.sign-in")}</h1>

    <form
        class="w-80"
        method="POST"
        use:enhance={(form) => {
            signingIn = true;
            return async ({ result, update }) => {
                signingIn = false;

                if (result.type === "failure") {
                    form.formElement.reset();
                } else if (result.type === "error") {
                    toastStore.trigger({
                        background: "preset-filled-error-500",
                        message: result.error
                    });
                }
                await update();
            };
        }}
    >
        <div class="bg-surface-100-900 ring-outline-token rounded-container flex flex-col space-y-4 p-4">
            {#if data.isCallback}
                <div class="flex flex-col items-center justify-center space-y-4">
                    <Progress width="w-12 md:w-16" />
                    <span class="text-lg md:text-xl">{$t("auth.authenticating")}</span>
                </div>
            {:else}
                {#if data.enableLogin}
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
                        {#if form?.errors?.username}
                            <span class="unstyled text-xs text-red-500">
                                {form.errors.username[0]}
                            </span>
                        {/if}
                    </label>

                    <div class="relative flex flex-col space-y-4">
                        <PasswordInput
                            id="password"
                            name="password"
                            error={form?.incorrect || form?.error}
                            label={$t("auth.password")}
                            required
                        />

                        {#if form?.incorrect}
                            <span class="unstyled text-xs text-red-500">
                                {$t("errors.invalid-credentials")}
                            </span>
                        {/if}
                        {#if form?.errors?.password}
                            <span class="unstyled text-xs text-red-500">
                                {form.errors.password[0]}
                            </span>
                        {/if}

                        <div class="flex items-center justify-center gap-x-4">
                            <button class="preset-filled-primary-500 btn w-min" disabled={signingIn}>
                                {#if signingIn}
                                    <Progress width="w-4" />
                                {/if}
                                <span>{$t("auth.sign-in")}</span>
                            </button>
                            {#if data.enableSignup}
                                <a href="/signup">{$t("auth.create-an-account")}</a>
                            {/if}
                        </div>

                        <a class="absolute top-0 mt-0! pt-0.5 text-sm ltr:right-0 rtl:left-0" href="/forgot-password">
                            {$t("auth.forgot-password")}
                        </a>
                    </div>
                {/if}
                {#if data.oidcConfig?.ready}
                    {#if data.enableLogin}
                        <div class="flex w-full items-center justify-center">
                            <hr class="my-2 h-px w-3/4 border-0" />
                            <span class="bg-surface-100-900 absolute left-1/2 -translate-x-1/2 px-2">
                                {$t("auth.or")}
                            </span>
                        </div>
                    {/if}
                    <div class="flex justify-center">
                        <button
                            class="preset-filled-primary-500 btn"
                            disabled={signingIn}
                            onclick={() => window.location.assign(`/login/oidc${page.url.search}`)}
                            type="button"
                        >
                            {$t("auth.sign-in-with", { values: { provider: data.oidcConfig.providerName || "OAuth" } })}
                        </button>
                    </div>
                {/if}
            {/if}
        </div>
    </form>
    {#if data.error}
        <Alert class="w-80 md:w-1/2" noicon title="Failed to authenticate with OAuth" type="error">
            <pre>{data.error}</pre>
        </Alert>
    {/if}
</div>

<svelte:head>
    <title>{$t("auth.sign-in")}</title>
</svelte:head>
