<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { Email, General, Security, options } from "$lib/components/admin/Settings";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { getFormatter } from "$lib/i18n";

    const { data }: PageProps = $props();
    const t = getFormatter();

    const toastStore = getToastStore();

    onMount(() => {
        if (!page.url.hash) {
            goto(options[0].hash);
        }
    });

    const currentHash = $derived(page.url.hash);

    let config = $state(data.config);
    let groups = $state(data.groups);
    let sending = $state(false);
    let saved = $state(false);
</script>

<form
    action="?/settings"
    method="POST"
    use:enhance={({ action }) => {
        if (action.search.endsWith("?/send-test")) {
            sending = true;
        }
        return ({ action, result }) => {
            if (action.search.endsWith("?/settings") && result.type === "success") {
                saved = true;
                toastStore.trigger({ message: $t("admin.settings-saved-toast") });
            }
            if (action.search.endsWith("?/send-test") && result.type === "success") {
                sending = false;
                toastStore.trigger({ message: $t("admin.test-email-sent-toast") });
            }
        };
    }}
>
    <div class="flex w-full flex-col gap-4 md:flex-row">
        <!-- Sidebar nav for larger screens -->
        <aside class="hidden md:block md:w-1/3 lg:w-1/4">
            <nav class="list-nav">
                <ul>
                    {#each options as option}
                        <li>
                            <a class={[currentHash === option.hash && "!variant-filled-primary"]} href={option.hash}>
                                {option.label($t)}
                            </a>
                        </li>
                    {/each}
                </ul>
            </nav>
        </aside>
        <!-- Select nav for small screens -->
        <aside class="w-full md:hidden">
            <select class="select w-full" onchange={(e) => goto(e.currentTarget.value)} value={currentHash}>
                {#each options as option}
                    <option value={option.hash}>{option.label($t)}</option>
                {/each}
            </select>
        </aside>
        <!-- Settings -->
        <div class="w-full">
            <General {config} {groups} hidden={currentHash !== options[0].hash} />
            <Email {config} hidden={currentHash !== options[1].hash} {saved} {sending} />
            <Security {config} hidden={currentHash !== options[2].hash} />
            <!-- Save buttons -->
            <div class="flex w-full flex-row justify-end pt-5">
                <button class="variant-filled-primary btn" type="submit">
                    {$t("general.save")}
                </button>
            </div>
        </div>
    </div>
</form>
