<script lang="ts">
    import { enhance } from "$app/forms";
    import { getFormatter } from "$lib/i18n";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { successToast, errorToast } from "$lib/components/toasts";

    type ApiKey = {
        id: string;
        name: string;
        keyPrefix: string;
        createdAt: Date;
        lastUsedAt: Date | null;
        expiresAt: Date | null;
    };

    let { apiKeys = [], newApiKey = null }: { apiKeys: ApiKey[], newApiKey?: string | null } = $props();
    
    const t = getFormatter();
    const toastStore = getToastStore();

    let showCreateForm = $state(false);
    let newKeyName = $state("");
    let newKeyExpires = $state("");
    let displayedNewKey = $state<string | null>(newApiKey);
    let keyCopied = $state(false);

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        keyCopied = true;
        successToast(toastStore, $t("account.api-key-copied"));
        setTimeout(() => {
            keyCopied = false;
        }, 2000);
    }

    function formatDate(date: Date | null): string {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
    }

    function dismissNewKey() {
        displayedNewKey = null;
    }
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h3 class="h3">{$t("account.api-keys")}</h3>
        <button
            class="btn variant-filled-primary"
            onclick={() => showCreateForm = !showCreateForm}
        >
            <iconify-icon icon="mdi:plus"></iconify-icon>
            <span>{$t("account.create-api-key")}</span>
        </button>
    </div>

    {#if displayedNewKey}
        <aside class="alert variant-ghost-success">
            <div class="alert-message">
                <h4 class="h4">{$t("account.api-key-created")}</h4>
                <p class="text-sm">{$t("account.api-key-warning")}</p>
                <div class="mt-2 flex items-center gap-2">
                    <code class="code flex-1 break-all p-2">{displayedNewKey}</code>
                    <button
                        class="btn-icon variant-filled"
                        onclick={() => copyToClipboard(displayedNewKey!)}
                        title={$t("account.copy-api-key")}
                    >
                        <iconify-icon icon={keyCopied ? "mdi:check" : "mdi:content-copy"}></iconify-icon>
                    </button>
                </div>
            </div>
            <button class="btn-icon variant-ghost" onclick={dismissNewKey}>
                <iconify-icon icon="mdi:close"></iconify-icon>
            </button>
        </aside>
    {/if}

    {#if showCreateForm}
        <div class="card p-4">
            <form
                method="POST"
                action="?/createApiKey"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        console.log("Form result:", result);
                        console.log("Form result.data:", JSON.stringify(result.data, null, 2));
                        if (result.type === "success") {
                            const data = result.data as Record<string, unknown>;
                            console.log("Data keys:", Object.keys(data || {}));
                            const newKey = data?.newApiKey as string;
                            console.log("newKey value:", newKey);
                            if (newKey) {
                                displayedNewKey = newKey;
                                showCreateForm = false;
                                newKeyName = "";
                                newKeyExpires = "";
                            }
                        } else if (result.type === "failure") {
                            errorToast(toastStore, $t("general.oops"));
                        }
                        await update({ invalidateAll: true });
                    };
                }}
            >
                <div class="grid gap-4 md:grid-cols-2">
                    <label class="label">
                        <span>{$t("account.api-key-name")}</span>
                        <input
                            class="input"
                            type="text"
                            name="name"
                            bind:value={newKeyName}
                            placeholder={$t("account.api-key-name-placeholder")}
                            required
                        />
                    </label>
                    <label class="label">
                        <span>{$t("account.api-key-expires")}</span>
                        <input
                            class="input"
                            type="date"
                            name="expiresAt"
                            bind:value={newKeyExpires}
                        />
                    </label>
                </div>
                <div class="mt-4 flex gap-2">
                    <button type="submit" class="btn variant-filled-primary">
                        {$t("account.create")}
                    </button>
                    <button
                        type="button"
                        class="btn variant-ghost"
                        onclick={() => showCreateForm = false}
                    >
                        {$t("general.cancel")}
                    </button>
                </div>
            </form>
        </div>
    {/if}

    {#if apiKeys.length === 0}
        <p class="text-surface-500-400-token">{$t("account.no-api-keys")}</p>
    {:else}
        <div class="table-container">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>{$t("account.api-key-name")}</th>
                        <th>{$t("account.api-key-prefix")}</th>
                        <th>{$t("account.api-key-created")}</th>
                        <th>{$t("account.api-key-last-used")}</th>
                        <th>{$t("account.api-key-expires")}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each apiKeys as key}
                        <tr>
                            <td>{key.name}</td>
                            <td><code class="code">{key.keyPrefix}...</code></td>
                            <td>{formatDate(key.createdAt)}</td>
                            <td>{formatDate(key.lastUsedAt)}</td>
                            <td>{key.expiresAt ? formatDate(key.expiresAt) : $t("account.never")}</td>
                            <td>
                                <form
                                    method="POST"
                                    action="?/deleteApiKey"
                                    use:enhance={() => {
                                        return async ({ update }) => {
                                            update({ invalidateAll: true });
                                        };
                                    }}
                                >
                                    <input type="hidden" name="id" value={key.id} />
                                    <button
                                        type="submit"
                                        class="btn-icon btn-icon-sm variant-ghost-error"
                                        title={$t("account.delete-api-key")}
                                    >
                                        <iconify-icon icon="mdi:delete"></iconify-icon>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
