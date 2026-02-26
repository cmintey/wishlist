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

    const { data, form }: PageProps = $props();
    const t = getFormatter();

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

<div class="flex flex-col space-y-2">
    <h1 class="h1 mb-2">{data.editingUser.name}</h1>
    <hr class="hr" />
    <h2 class="h2">{$t("admin.username-field", { values: { username: data.editingUser.username } })}</h2>
    <h3 class="h3">{$t("admin.id-field", { values: { id: data.editingUser.id } })}</h3>
</div>

<form method="POST" use:enhance>
    <div class="mt-4 flex flex-col space-y-4 md:flex-row md:space-y-0 md:gap-x-4">
        <button class="preset-filled-primary-500 btn w-fit" formaction="?/reset-password">
            {$t("admin.generate-reset-password-link")}
        </button>
        {#if data.editingUser.role.name == "ADMIN"}
            <button class="preset-tonal-secondary border-secondary-500 btn w-fit border" formaction="?/remove-admin">
                {$t("admin.remove-admin")}
            </button>
        {:else}
            <button class="preset-tonal-secondary border-secondary-500 btn w-fit border" formaction="?/make-admin">
                {$t("admin.make-admin")}
            </button>
        {/if}
        <ConfirmModal
            description={$t("admin.delete-user-confirmation", { values: { username: data.editingUser.username } })}
            onConfirm={handleDelete}
            title={$t("general.please-confirm")}
        >
            {#snippet trigger(props)}
                <button class="preset-tonal-error border-error-500 btn w-fit border" {...props}>
                    {$t("admin.delete-user")}
                </button>
            {/snippet}
        </ConfirmModal>
    </div>
</form>

{#if form?.success && form?.url}
    <TokenCopy url={form.url}>{$t("admin.password-reset-link")}</TokenCopy>
{/if}
