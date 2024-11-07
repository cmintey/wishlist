<script lang="ts">
    import { getToastStore, type ToastSettings, getModalStore } from "@skeletonlabs/skeleton";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import { page } from "$app/stores";
    import type { Group } from "@prisma/client";
    import { fade } from "svelte/transition";

    interface Props {
        config: Config;
        groups?: Group[];
        defaultGroup?: Group | undefined;
        vertical?: boolean;
    }

    let { config, groups = [], defaultGroup = undefined, vertical = false }: Props = $props();

    const modalStore = getModalStore();
    const toastStore = getToastStore();

    let form = $derived($page.form);

    let groupId = $state("");
    let email = $state("");
    let submitButton: HTMLButtonElement | undefined = $state();
    let showUrl = $state(true);

    $effect(() => {
        $inspect(form);
        if (form?.success && form?.sent !== undefined && config.smtp.enable) {
            let toastConfig: ToastSettings;
            if (form?.sent) {
                toastConfig = {
                    message: "Invite sent!",
                    background: "variant-filled-success",
                    autohide: true,
                    timeout: 3000
                };
            } else {
                toastConfig = {
                    message: `Invite failed to send: ${form?.message} `,
                    background: "variant-filled-error",
                    autohide: true,
                    timeout: 3000
                };
            }
            toastStore.trigger(toastConfig);
        }
    });

    const triggerInviteModal = () => {
        if (!config.smtp.enable && groups.length === 0 && defaultGroup) {
            groupId = defaultGroup.id;
            setTimeout(() => submitButton?.click(), 200);
            showUrl = true;
            return;
        }

        modalStore.trigger({
            type: "component",
            component: "inviteUser",
            meta: {
                groups,
                defaultGroup,
                smtpEnabled: config.smtp.enable
            },
            response(data: { group?: string; email?: string }) {
                if (data.group) groupId = data.group;
                if (data.email) email = data.email;
                if (groupId) setTimeout(() => submitButton?.click(), 200);
                showUrl = true;
            }
        });
    };
</script>

<div class="flex flex-col space-y-4 {vertical ? 'items-center' : 'md:flex-row md:items-end md:space-x-4 md:space-y-0'}">
    <button class="variant-filled-primary btn w-fit" onclick={triggerInviteModal} type="button">
        <iconify-icon icon="ion:person-add"></iconify-icon>
        <p>Invite User</p>
    </button>

    <input id="invite-group" name="invite-group" class="hidden" value={groupId} />
    {#if config.smtp.enable}
        <input id="invite-email" name="invite-email" class="hidden" value={email} />
    {/if}

    {#if showUrl && form?.url}
        <div
            class="flex flex-col space-y-2 {vertical
                ? 'items-center'
                : 'md:flex-row md:items-center md:space-x-2 md:space-y-0'}"
            out:fade
        >
            <TokenCopy url={form.url} on:copied={() => setTimeout(() => (showUrl = false), 1000)}>
                Invite link
            </TokenCopy>
            <span class="text-sm italic">This invite link is only valid for one signup</span>
        </div>
    {/if}

    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button bind:this={submitButton} class="hidden" type="submit"></button>
</div>
