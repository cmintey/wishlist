<script lang="ts">
    import { enhance } from "$app/forms";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import type { ActionData, PageData } from "./$types";

    interface Props {
        data: PageData;
        form: ActionData;
    }

    let { data, form }: Props = $props();

    let loading = $state(false);
</script>

{#if data.smtpEnabled}
    <div class="flex flex-col items-center space-y-4">
        <h1 class="h1">Reset Password</h1>
        {#if form?.success}
            <div class="flex w-80 flex-col items-center space-y-1 text-center md:w-full">
                <iconify-icon icon="ion:checkmark-circle-outline" width="100"></iconify-icon>
                <span class="text-xl font-bold">Success!</span>
                <p>Check your email and follow the link to reset your password.</p>
            </div>
        {:else}
            <p class="w-80 text-center">Enter your email address and we'll send you a password reset link.</p>
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
                    class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token"
                >
                    <label class="w-full" for="email">
                        <span>Email</span>
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
                        <span class="text-error-700-200-token text-xs">Please provide a valid email address.</span>
                    {/if}

                    <div>
                        <button class="variant-filled-primary btn" type="submit">Submit</button>
                    </div>
                </div>
            </form>
        {/if}
    </div>
{:else}
    <div class="flex flex-col items-center space-y-4">
        <h1 class="h1">Self-service password reset unavailable.</h1>
        <span class="text-xl">Please contact the site administrator to reset your password.</span>
        <a href="/login">Return to login</a>
    </div>
{/if}

{#if loading}
    <Backdrop text="Processing..." />
{/if}

<svelte:head>
    <title>Forgot Password</title>
</svelte:head>
