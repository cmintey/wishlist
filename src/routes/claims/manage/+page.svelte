<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import { toaster } from "$lib/components/toaster";
    import { getFormatter } from "$lib/i18n";
    import type { PageProps } from "./$types";

    const { data, form }: PageProps = $props();

    const t = getFormatter();

    let loading = $state(false);
    let released = $state(false);
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">{$t("wishes.manage-claim")}</h1>

    <div class="bg-surface-100-900 rounded-container border-surface-200-800 flex w-80 flex-col space-y-4 border p-4">
        <span class="text-lg font-bold">{data.itemName}</span>

        {#if released}
            <span>{$t("wishes.claim-released", { values: { itemName: data.itemName } })}</span>
        {:else}
            <span class="subtext">
                {$t("wishes.manage-claim-description", {
                    values: { quantity: data.quantity, listName: data.listName }
                })}
            </span>

            <form
                action="?/unclaim"
                method="POST"
                use:enhance={() => {
                    loading = true;
                    return async ({ result, update }) => {
                        loading = false;
                        if (result.type === "success") {
                            // The token is spent, so re-running the load would 404.
                            // Show the confirmation in place instead.
                            released = true;
                            toaster.info({
                                description: $t("wishes.claim-released", { values: { itemName: data.itemName } })
                            });
                            return;
                        }

                        if (result.type === "failure") {
                            toaster.error({
                                description: (result.data?.message as string) || $t("general.oops")
                            });
                        } else if (result.type === "error") {
                            toaster.error({ description: result.error?.message || $t("general.oops") });
                        }
                        await update({ reset: false });
                    };
                }}
            >
                <input name="token" type="hidden" value={page.url.searchParams.get("token")} />
                <button class="preset-filled-error-500 btn w-full" disabled={loading} type="submit">
                    {#if loading}
                        <span class="loading loading-spinner loading-xs"></span>
                    {/if}
                    {$t("wishes.release-claim")}
                </button>
            </form>

            {#if form?.error}
                <span class="text-invalid text-wrap">{form.message}</span>
            {/if}
        {/if}
    </div>
</div>

<svelte:head>
    <title>{$t("wishes.manage-claim")}</title>
</svelte:head>
