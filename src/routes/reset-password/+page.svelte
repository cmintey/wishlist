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
    let loading = $state(false);

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
            loading = true;
            if (data.userId) formData.append("userId", data.userId);
            if (data.id) formData.append("id", data.id);
            return async ({ result, update }) => {
                loading = false;
                if (result.type === "redirect") {
                    toaster.info({ description: $t("auth.your-password-was-reset") });
                } else if (result.type === "error") {
                    toaster.error({ description: result.error?.message || $t("general.oops") });
                }
                update();
            };
        }}
    >
        <div class="bg-surface-100-900 rounded-container flex flex-col space-y-4 p-4 border border-surface-200-800">
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
                <span class="text-invalid">{$t("auth.passwords-must-match")}</span>
            {/if}
            {#if form?.errors?.newPassword}
                <span class="text-invalid">{form?.errors?.newPassword[0]}</span>
            {/if}

            <button
                class="preset-filled-primary-500 btn w-full"
                disabled={newPassword === "" || newPassword !== confirmPassword || loading}
                type="submit"
            >
                {#if loading}
                    <span class="loading loading-spinner loading-xs"></span>
                {/if}
                {$t("auth.update-password")}
            </button>

            {#if form?.errors?.id}
                <span class="text-invalid text-wrap">{form.errors.id}</span>
            {/if}
            {#if form?.errors?.userId}
                <span class="text-invalid text-wrap">{form.errors.userId}</span>
            {/if}
        </div>
    </form>
</div>

<svelte:head>
    <title>{$t("auth.reset-password")}</title>
</svelte:head>
