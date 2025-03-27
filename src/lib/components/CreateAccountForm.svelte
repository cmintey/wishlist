<script lang="ts">
    import { page } from "$app/state";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import { t } from "svelte-i18n";

    interface Props {
        hideActions?: boolean;
    }

    let { hideActions = false }: Props = $props();

    let data = $derived(page.data);
    let formData = $derived(page.form);

    let password = $state("");
    let passwordConfirm = $state("");

    let signingIn = $state(false);

    $effect(() => {
        if (page.error) signingIn = false;
    });
</script>

<div class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token">
    {#if data.id}
        <input id="tokenId" name="tokenId" class="hidden" value={data.id} />
    {/if}
    <label for="name">
        <span>{$t("auth.name")}</span>
        <input id="name" name="name" class="input" autocomplete="name" required type="text" />
    </label>

    <div class="flex flex-col space-y-4 md:flex-row md:space-x-2 md:space-y-0">
        <label for="username">
            <span>{$t("auth.username")}</span>
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
            <span>{$t("auth.email")}</span>
            <input id="email" name="email" class="input" autocomplete="email" required type="email" />
        </label>
    </div>

    <PasswordInput
        id="password"
        name="password"
        label={$t("auth.password")}
        required
        strengthMeter
        bind:value={password}
    />
    <PasswordInput id="confirmpassword" label={$t("auth.confirm-password")} required bind:value={passwordConfirm} />

    {#if password !== passwordConfirm}
        <span class="unstyled text-xs text-red-500">{$t("auth.passwords-must-match")}</span>
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
            <button
                class="variant-filled-primary btn w-min"
                disabled={password !== passwordConfirm || signingIn}
                onclick={() => (signingIn = true)}
                type="submit"
            >
                {#if signingIn}
                    <ProgressRadial width="w-4" />
                {/if}
                <span>{$t("auth.create-account")}</span>
            </button>
            <a href="/login">{$t("auth.sign-in")}</a>
        </div>
    {/if}
</div>
