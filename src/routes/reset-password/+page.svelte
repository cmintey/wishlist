<script lang="ts">
    import { enhance } from "$app/forms";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";
    const { data, form }: PageProps = $props();

    const t = getFormatter();

    let newPassword = $state("");
    let confirmPassword = $state("");

    onMount(() => {
        window.history.replaceState({}, "", "/reset-password");
    });
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("auth.reset-password")}</h1>

    <form
        class="w-80"
        method="POST"
        use:enhance={({ formData }) => {
            formData.append("userId", data.userId || "");
            formData.append("id", `${data.id}` || "0");
            return async ({ result, update }) => {
                if (result.type === "redirect") {
                    toaster.info({ description: $t("auth.your-password-was-reset") });
                } else if (result.type === "error") {
                    toaster.error({ description: $t("general.oops") });
                }
                update();
            };
        }}
    >
        <div class="bg-surface-100-900 rounded-container flex flex-col space-y-4 p-4 inset-ring">
            <PasswordInput
                id="password"
                name="password"
                autocomplete="new-password"
                label={$t("auth.new-password")}
                required
                strengthMeter
                bind:value={newPassword}
            />
            <PasswordInput
                id="confirmpassword"
                autocomplete="new-password"
                label={$t("auth.confirm-password")}
                required
                bind:value={confirmPassword}
            />

            {#if newPassword !== confirmPassword}
                <span class="unstyled text-xs text-red-500">{$t("auth.passwords-must-match")}</span>
            {/if}
            {#if form?.errors?.newPassword}
                <span class="text-xs text-red-500">{form?.errors?.newPassword[0]}</span>
            {/if}

            <button
                class="preset-filled-primary-500 btn w-fit"
                disabled={newPassword === "" || newPassword !== confirmPassword}
                type="submit"
            >
                {$t("auth.update-password")}
            </button>
        </div>
    </form>
</div>

<svelte:head>
    <title>{$t("auth.reset-password")}</title>
</svelte:head>
