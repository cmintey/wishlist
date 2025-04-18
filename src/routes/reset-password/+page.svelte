<script lang="ts">
    import { enhance } from "$app/forms";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { onMount } from "svelte";
    import type { ActionData, PageData } from "./$types";
    import { t } from "svelte-i18n";
    import { getToastStore } from "@skeletonlabs/skeleton";

    interface Props {
        data: PageData;
        form: ActionData;
    }

    let { data, form }: Props = $props();

    const toastStore = getToastStore();

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
                    toastStore.trigger({
                        message: $t("auth.your-password-was-reset")
                    });
                } else if (result.type === "error") {
                    toastStore.trigger({
                        message: $t("general.oops")
                    });
                }
                update();
            };
        }}
    >
        <div class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token">
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

            {#if form?.error}
                <ul>
                    {#each form.errors as error}
                        {#if error.field === "newPassword"}
                            {#each error.message.split("\n") as message}
                                <li class="text-xs text-red-500">{message}</li>
                            {/each}
                        {:else}
                            <li class="text-xs text-red-500">{error.message}</li>
                        {/if}
                    {/each}
                </ul>
            {/if}
            <button
                class="variant-filled-primary btn w-fit"
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
