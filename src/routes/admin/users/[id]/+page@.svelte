<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto, invalidateAll } from "$app/navigation";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";
    import ConfirmModal from "$lib/components/modals/ConfirmModal.svelte";
    import { resolve } from "$app/paths";
    import { UserAPI } from "$lib/api/users";
    import EditProfile from "$lib/components/account/EditProfile.svelte";

    const { data, form }: PageProps = $props();
    const t = getFormatter();

    const profileEditDisabled = $derived(
        data.oidcConfig.ready && data.oidcConfig.enableSync === true && data.editingUser.oauthId !== null
    );

    const handleDelete = async () => {
        const userAPI = new UserAPI(data.editingUser.id);
        const resp = await userAPI.delete();

        if (resp.ok) {
            await goto(resolve("/admin/users"));
            invalidateAll();

            toaster.info({
                description: $t("admin.user-was-deleted", { values: { username: data.editingUser.username } })
            });
        } else {
            toaster.info({ description: $t("general.oops") });
        }
    };
</script>

<EditProfile autocomplete={false} disabled={profileEditDisabled} user={data.editingUser}></EditProfile>

<form class="mt-4 flex flex-col flex-wrap gap-4" method="POST" use:enhance>
    <div class="flex flex-wrap gap-4">
        <button class="preset-filled-primary-500 btn w-full sm:w-fit" formaction="?/reset-password">
            {$t("admin.generate-reset-password-link")}
        </button>
        {#if form?.success && form?.url}
            <TokenCopy url={form.url}>{$t("admin.password-reset-link")}</TokenCopy>
        {/if}
        {#if data.editingUser.role.name == "ADMIN"}
            <button
                class="preset-tonal-secondary inset-ring-secondary-500 btn w-full inset-ring sm:w-fit"
                formaction="?/remove-admin"
            >
                {$t("admin.remove-admin")}
            </button>
        {:else}
            <button
                class="preset-tonal-secondary inset-ring-secondary-500 btn w-full inset-ring sm:w-fit"
                formaction="?/make-admin"
            >
                {$t("admin.make-admin")}
            </button>
        {/if}
    </div>

    <div class="flex flex-wrap gap-4">
        {#if data.editingUser.oauthId}
            <button class="preset-filled-primary-500 btn w-fit" formaction="?/unlinkoauth">
                {$t("auth.unlink-oauth", { values: { providerName: data.oidcConfig.providerName } })}
            </button>
        {/if}

        <ConfirmModal
            description={$t("admin.clear-sessions-confirmation")}
            onConfirm={handleDelete}
            title={$t("general.please-confirm")}
        >
            {#snippet trigger(props)}
                <button class="preset-tonal-error inset-ring-error-500 btn w-full inset-ring sm:w-fit" {...props}>
                    {$t("admin.clear-sessions")}
                </button>
            {/snippet}
        </ConfirmModal>

        <ConfirmModal
            description={$t("admin.delete-user-confirmation", { values: { username: data.editingUser.username } })}
            onConfirm={handleDelete}
            title={$t("general.please-confirm")}
        >
            {#snippet trigger(props)}
                <button class="preset-filled-error-400-600 btn w-full sm:w-fit" {...props}>
                    {$t("admin.delete-user")}
                </button>
            {/snippet}
        </ConfirmModal>
    </div>
</form>

<svelte:head>
    <title>{data.editingUser.name} - {$t("admin.administration")}</title>
</svelte:head>
