<script lang="ts">
    import { enhance } from "$app/forms";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import type { ActionData, PageData } from "./$types";
    import { t } from "svelte-i18n";

    interface Props {
        data: PageData;
        form: ActionData;
    }

    let { data, form }: Props = $props();

    let loading = $state(false);
</script>

{#if data.smtpEnabled}
    <div class="flex flex-col items-center space-y-4">
        <h1 class="h1">{$t("auth.reset-password")}</h1>
        {#if form?.success}
            <div class="flex w-80 flex-col items-center space-y-1 text-center md:w-full">
                <iconify-icon icon="ion:checkmark-circle-outline" width="100"></iconify-icon>
                <span class="text-xl font-bold">{$t("general.success")}</span>
                <p>{$t("auth.check-your-email")}</p>
            </div>
        {:else}
            <p class="w-80 text-center">{$t("auth.enter-email")}</p>
            <form
                class="w-80"
                method="POST"
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        loading = false;
                        await update();
                    };
                }}
            >
                <div
                    class="bg-surface-100-800-token ring-outline-token rounded-container-token flex flex-col space-y-4 p-4"
                >
                    <label class="w-full" for="email">
                        <span>{$t("auth.email")}</span>
                        <input
                            id="email"
                            name="email"
                            class="input"
                            class:input-invalid={form?.error}
                            required
                            type="email"
                        />
                    </label>
                    {#if form?.error}
                        <span class="text-error-700-200-token text-xs">{$t("errors.invalid-email")}</span>
                    {/if}

                    <div>
                        <button class="variant-filled-primary btn" type="submit">{$t("general.submit")}</button>
                    </div>
                </div>
            </form>
        {/if}
    </div>
{:else}
    <div class="flex flex-col items-center space-y-4">
        <h1 class="h1">{$t("auth.self-service-password-reset-unavailable")}</h1>
        <span class="text-xl">{$t("auth.contact-admin")}</span>
        <a href="/login">{$t("auth.return-to-login")}</a>
    </div>
{/if}

{#if loading}
    <Backdrop text={$t("general.processing")} />
{/if}

<svelte:head>
    <title>{$t("auth.forgot-password")}</title>
</svelte:head>
