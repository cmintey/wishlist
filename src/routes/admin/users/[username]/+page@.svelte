<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto, invalidateAll } from "$app/navigation";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";

    const { data, form }: PageProps = $props();
    const t = getFormatter();

    const modalStore = getModalStore();
    const toastStore = getToastStore();

    const handleDelete = async (username: string, userId: string) => {
        const settings: ModalSettings = {
            type: "confirm",
            title: $t("general.please-confirm"),
            body: $t("admin.delete-user-confirmation", { values: { username } }),
            // confirm = TRUE | cancel = FALSE
            response: async (r: boolean) => {
                if (r) {
                    const resp = await fetch(`/api/users/${userId}`, {
                        method: "DELETE",
                        headers: {
                            "content-type": "application/json",
                            accept: "application/json"
                        }
                    });

                    if (resp.ok) {
                        await goto("/admin/users");
                        invalidateAll();

                        toastStore.trigger({
                            message: $t("admin.user-was-deleted", { values: { username } }),
                            autohide: true,
                            timeout: 5000
                        });
                    } else {
                        toastStore.trigger({
                            message: $t("general.oops"),
                            background: "variant-filled-warning",
                            autohide: true,
                            timeout: 5000
                        });
                    }
                }
            },
            buttonTextCancel: $t("general.cancel"),
            buttonTextConfirm: $t("general.confirm")
        };
        modalStore.trigger(settings);
    };
</script>

<div class="flex flex-col space-y-2">
    <h1 class="h1 mb-2">{data.editingUser.name}</h1>
    <hr />
    <h2 class="h2">{$t("admin.username-field", { values: { username: data.editingUser.username } })}</h2>
    <h3 class="h3">{$t("admin.id-field", { values: { id: data.editingUser.id } })}</h3>
</div>

<form method="POST" use:enhance>
    <div class="mt-4 flex flex-col space-y-4 md:flex-row md:gap-x-4 md:space-y-0">
        <button class="variant-filled-primary btn w-fit" formaction="?/reset-password">
            {$t("admin.generate-reset-password-link")}
        </button>
        {#if data.editingUser.role.name == "ADMIN"}
            <button class="variant-ghost-secondary btn w-fit" formaction="?/remove-admin">
                {$t("admin.remove-admin")}
            </button>
        {:else}
            <button class="variant-ghost-secondary btn w-fit" formaction="?/make-admin">
                {$t("admin.make-admin")}
            </button>
        {/if}
        <button
            class="variant-ghost-error btn w-fit"
            onclick={() => handleDelete(data.editingUser.username, data.editingUser.id)}
            type="button"
        >
            {$t("admin.delete-user")}
        </button>
    </div>
</form>

{#if form?.success && form?.url}
    <TokenCopy url={form.url}>{$t("admin.password-reset-link")}</TokenCopy>
{/if}
