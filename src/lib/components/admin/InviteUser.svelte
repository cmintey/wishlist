<script context="module" lang="ts">
</script>

<script lang="ts">
    import { getToastStore, type ToastSettings, getModalStore } from "@skeletonlabs/skeleton";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import { page } from "$app/stores";
    import type { Group } from "@prisma/client";
    import { fade } from "svelte/transition";

    export let config: Config;
    export let groups: Group[] = [];
    export let defaultGroup: Group | undefined = undefined;
    export let vertical = false;

    const modalStore = getModalStore();
    const toastStore = getToastStore();

    $: form = $page.form;

    const triggerToast = () => {
        const toastConfig: ToastSettings = {
            message: "Invite sent!",
            background: "variant-filled-success",
            autohide: true,
            timeout: 3000
        };
        toastStore.trigger(toastConfig);
    };

    if (form?.success && config.smtp.enable) {
        triggerToast();
    }

    let groupId = "";
    let email = "";
    let submitButton: HTMLButtonElement;
    let showUrl = true;

    const triggerInviteModal = () => {
        if (groups.length === 0 && defaultGroup) {
            groupId = defaultGroup.id;
            setTimeout(() => submitButton.click(), 200);
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
                if (groupId) setTimeout(() => submitButton.click(), 200);
                showUrl = true;
            }
        });
    };
</script>

<div class="flex flex-col space-y-4 {vertical ? 'items-center' : 'md:flex-row md:items-end md:space-x-4 md:space-y-0'}">
    <button class="variant-filled-primary btn w-fit" type="button" on:click={triggerInviteModal}>
        <iconify-icon icon="ion:person-add" />
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

    <button bind:this={submitButton} class="hidden" type="submit" />
</div>
