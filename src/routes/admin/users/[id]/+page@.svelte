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
    import Avatar from "$lib/components/Avatar.svelte";
    import Input from "$lib/components/Input.svelte";
    import FileUpload from "$lib/components/FileUpload.svelte";
    import Label from "$lib/components/Label.svelte";

    const { data, form }: PageProps = $props();
    const t = getFormatter();

    let isEditing = $state(false);

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

{#snippet iconPrefix(icon: string, value: string)}
    <div class="flex items-center gap-2">
        <iconify-icon {icon}></iconify-icon>
        <span>{value}</span>
    </div>
{/snippet}

<div class="card bg-surface-100-900 border-surface-200-800 flex flex-col gap-1 p-4">
    <Avatar class="size-18 text-3xl" user={data.editingUser} />

    {#if isEditing}
        <form class="w-96">
            <Label value="Picture">
                <FileUpload name="picture" />
            </Label>
            <Label value="Name">
                <Input name="name" autocomplete="off" icon="ion:id-card" />
            </Label>
            <Label value="Username">
                <Input name="username" autocomplete="off" icon="ion:person" />
            </Label>
            <Label value="Email">
                <Input name="email" autocomplete="off" icon="ion:at" />
            </Label>
        </form>
    {:else}
        {@render iconPrefix("ion:id-card", data.editingUser.name)}
        {@render iconPrefix("ion:person", data.editingUser.username)}
        {@render iconPrefix("ion:at", data.editingUser.email)}
        {@render iconPrefix("ion:finger-print", data.editingUser.id)}
    {/if}

    <div class="mt-2">
        {#if data.editingUser.isOauthManaged}
            <span>Profile managed by OAuth Provider.</span>
        {:else if isEditing}
            <div class="flex gap-2">
                <button
                    class="btn preset-outlined-secondary-500 w-fit"
                    onclick={() => (isEditing = false)}
                    type="button"
                >
                    Cancel
                </button>
                <button class="btn preset-filled-primary-500 w-fit" onclick={() => (isEditing = false)} type="button">
                    Save
                </button>
            </div>
        {:else}
            <button class="btn preset-outlined-primary-500 w-fit" onclick={() => (isEditing = true)} type="button">
                Edit
            </button>
        {/if}
    </div>
</div>

<form class="mt-4 flex flex-col flex-wrap gap-4" method="POST" use:enhance>
    <div class="flex flex-wrap gap-4">
        <button class="preset-filled-primary-500 btn w-fit" formaction="?/reset-password">
            {$t("admin.generate-reset-password-link")}
        </button>
        {#if form?.success && form?.url}
            <TokenCopy url={form.url}>{$t("admin.password-reset-link")}</TokenCopy>
        {/if}
        {#if data.editingUser.role.name == "ADMIN"}
            <button class="preset-tonal-secondary border-secondary-500 btn w-fit border" formaction="?/remove-admin">
                {$t("admin.remove-admin")}
            </button>
        {:else}
            <button class="preset-tonal-secondary border-secondary-500 btn w-fit border" formaction="?/make-admin">
                {$t("admin.make-admin")}
            </button>
        {/if}
    </div>

    <div class="flex flex-wrap gap-4">
        <ConfirmModal
            description="Are you sure you wish to clear this user's sessions? The user will be logged out of all devices and will be required to log back in."
            onConfirm={handleDelete}
            title={$t("general.please-confirm")}
        >
            {#snippet trigger(props)}
                <button class="preset-tonal-error border-error-500 btn w-fit border" {...props}>
                    Clear user sessions
                </button>
            {/snippet}
        </ConfirmModal>

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

<svelte:head>
    <title>{data.editingUser.name} - {$t("admin.administration")}</title>
</svelte:head>
