<script lang="ts">
    import { page } from "$app/state";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import { getFormatter } from "$lib/i18n";
    import { ProgressRadial } from "@skeletonlabs/skeleton";

    interface Props {
        hideActions?: boolean;
        signingIn?: boolean;
    }

    const { hideActions = false, signingIn = false }: Props = $props();
    const t = getFormatter();

    let data = $derived(page.data);
    let formData = $derived(page.form);

    let password = $state("");
    let passwordConfirm = $state("");

    $inspect(formData);
</script>

<div class="bg-surface-100-800-token ring-outline-token flex flex-col space-y-4 p-4 rounded-container-token">
    {#if data.id}
        <input id="tokenId" name="tokenId" class="hidden" value={data.id} />
    {/if}
    <label for="name">
        <span>{$t("auth.name")}</span>
        <input id="name" name="name" class="input" autocomplete="name" required type="text" />
        {#if formData?.errors?.name}
            <span class="unstyled text-xs text-red-500">{formData.errors.name[0]}</span>
        {/if}
    </label>

    <div class="flex flex-col space-y-4 md:flex-row md:gap-x-2 md:space-y-0">
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
            {#if formData?.errors?.username}
                <span class="unstyled text-xs text-red-500">{formData.errors.username[0]}</span>
            {/if}
        </label>
        <label for="email">
            <span>{$t("auth.email")}</span>
            <input id="email" name="email" class="input" autocomplete="email" required type="email" />
            {#if formData?.errors?.email}
                <span class="unstyled text-xs text-red-500">{formData.errors.email[0]}</span>
            {/if}
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
    {#if formData?.errors?.password}
        <span class="unstyled text-xs text-red-500">{formData.errors.password[0]}</span>
    {/if}

    {#if formData?.error && formData?.message}
        <span class="unstyled text-xs text-red-500">{formData.message}</span>
    {/if}

    {#if !hideActions}
        <div class="flex items-center justify-center gap-x-4 pb-2">
            <button
                class="variant-filled-primary btn w-min"
                disabled={password !== passwordConfirm || signingIn}
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
