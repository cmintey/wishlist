<script lang="ts">
    import { page } from "$app/stores";
    import PasswordInput from "$lib/components/PasswordInput.svelte";

    interface Props {
        hideActions?: boolean;
    }

    let { hideActions = false }: Props = $props();

    let data = $derived($page.data);
    let formData = $derived($page.form);

    let password = $state("");
    let passwordConfirm = $state("");
</script>

<div class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token">
    {#if data.id}
        <input id="tokenId" name="tokenId" class="hidden" value={data.id} />
    {/if}
    <label for="name">
        <span>Name</span>
        <input id="name" name="name" class="input" autocomplete="name" required type="text" />
    </label>

    <div class="flex flex-col space-y-4 md:flex-row md:space-x-2 md:space-y-0">
        <label for="username">
            <span>Username</span>
            <input
                id="username"
                name="username"
                class="input"
                autocapitalize="off"
                autocomplete="username"
                required
                type="text"
            />
        </label>
        <label for="email">
            <span>Email</span>
            <input id="email" name="email" class="input" autocomplete="email" required type="email" />
        </label>
    </div>

    <PasswordInput id="password" name="password" label="Password" required strengthMeter bind:value={password} />
    <PasswordInput id="confirmpassword" label="Confirm Password" required bind:value={passwordConfirm} />

    {#if password !== passwordConfirm}
        <span class="unstyled text-xs text-red-500">Passwords must match</span>
    {/if}

    {#if formData?.error}
        <ul>
            {#each formData.errors as error}
                {#if error.field === "password"}
                    {#each error.message.split("\n") as message}
                        <li class="text-xs text-red-500">{message}</li>
                    {/each}
                {:else}
                    <li class="text-xs text-red-500">{error.message}</li>
                {/if}
            {/each}
        </ul>
    {/if}

    {#if !hideActions}
        <div class="flex items-center justify-center space-x-4 pb-2">
            <button class="variant-filled-primary btn w-min" disabled={password !== passwordConfirm} type="submit">
                Sign Up
            </button>
            <a href="/login">Sign in</a>
        </div>
    {/if}
</div>
