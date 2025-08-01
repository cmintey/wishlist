<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { getToastStore, ProgressRadial } from "@skeletonlabs/skeleton";
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
                        background: "variant-filled-error",
                        message: result.error
                    });
                }
                await update();
            };
        }}
    >
        <div class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token">
            {#if data.isCallback}
                <div class="flex flex-col items-center justify-center space-y-4">
                    <ProgressRadial width="w-12 md:w-16" />
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

                        <div class="flex items-center justify-center gap-x-4">
                            <button class="variant-filled-primary btn w-min" disabled={signingIn}>
                                {#if signingIn}
                                    <ProgressRadial width="w-4" />
                                {/if}
                                <span>{$t("auth.sign-in")}</span>
                            </button>
                            {#if data.enableSignup}
                                <a href="/signup">{$t("auth.create-an-account")}</a>
                            {/if}
                        </div>

                        <a class="absolute top-0 !mt-0 pt-0.5 text-sm ltr:right-0 rtl:left-0" href="/forgot-password">
                            {$t("auth.forgot-password")}
                        </a>
                    </div>
                {/if}
                {#if data.oidcConfig?.ready}
                    {#if data.enableLogin}
                        <div class="flex w-full items-center justify-center">
                            <hr class="my-2 h-px w-3/4 border-0" />
                            <span class="bg-surface-100-800-token absolute left-1/2 -translate-x-1/2 px-2">
                                {$t("auth.or")}
                            </span>
                        </div>
                    {/if}
                    <div class="flex justify-center">
                        <button
                            class="variant-filled-primary btn"
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
