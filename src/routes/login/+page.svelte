<script lang="ts">
    import { enhance } from "$app/forms";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import type { ActionData, PageServerData } from "./$types";

    interface Props {
        data: PageServerData;
        form: ActionData;
    }

    let { data, form }: Props = $props();
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">Sign in</h1>

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
        <div class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token">
            <label for="username">
                <span>Username</span>
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
                    label="Password"
                    required
                />

                {#if form?.incorrect}<span class="unstyled text-xs text-red-500">Invalid credentials!</span>{/if}
                {#if form?.error}
                    <ul>
                        {#each form.errors as error}
                            <li class="text-xs text-red-500">{error.message}</li>
                        {/each}
                    </ul>
                {/if}

                <div class="flex items-center justify-center space-x-4">
                    <button class="variant-filled-primary btn w-min">Log In</button>
                    {#if data.enableSignup}
                        <a href="/signup">Create an account</a>
                    {/if}
                </div>

                <div>
                    <a class="absolute right-0 top-0 text-sm" href="/forgot-password">Forgot password?</a>
                </div>
            </div>
        </div>
    </form>
</div>

<svelte:head>
    <title>Login</title>
</svelte:head>
