<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import { page } from "$app/state";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { Props } from "./steps";
    import type { Group } from "@prisma/client";
    import { goto } from "$app/navigation";
    import { Email, General, Security, options } from "$lib/components/admin/Settings";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { getFormatter } from "$lib/i18n";

    const { onSuccess }: Props = $props();
    const t = getFormatter();

    let config: Config = $state(page.data.config);
    let groups: Group[] = $state(page.data.groups);
    let form: HTMLFormElement | undefined = $state();
    let sending = $state(false);
    let saved = $state(false);

    const toastStore = getToastStore();
    const submit: Writable<() => void> = getContext("submit");
    $submit = () => {
        form?.requestSubmit();
    };

    onMount(() => {
        if (!page.url.hash) {
            goto(options[0].hash);
        }
    });

    const currentHash = $derived(page.url.hash);
</script>

<div class="flex w-full flex-col space-y-4">
    <div class="flex flex-col items-center">
        <h1 class="h1">{$t("setup.global-settings")}</h1>
        <span>{$t("setup.global-settings-subtext")}</span>
    </div>

    <form
        bind:this={form}
        action="/admin/settings?/settings"
        method="POST"
        use:enhance={({ action }) => {
            if (action.search.endsWith("?/send-test")) {
                sending = true;
            }
            return async ({ action, result }) => {
                if (action.search.endsWith("?/settings") && result.type === "success" && result.data?.success) {
                    onSuccess();
                }
                if (action.search.endsWith("?/send-test") && result.type === "success") {
                    sending = false;
                    toastStore.trigger({ message: $t("admin.test-email-sent-toast") });
                }
                await applyAction(result);
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
                                <a
                                    class={[currentHash === option.hash && "!variant-filled-primary"]}
                                    href={option.hash}
                                >
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
                <Email {config} hidden={currentHash !== options[1].hash} {sending} />
                <Security {config} hidden={currentHash !== options[2].hash} />
            </div>
        </div>
    </form>
</div>
