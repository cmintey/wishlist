<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { Dialog, Listbox, useListCollection } from "@skeletonlabs/skeleton-svelte";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";
    import type { Group } from "$lib/generated/prisma/client";
    import Popup from "../Popup.svelte";

    interface Props {
        trigger: BaseModalProps["trigger"];
        groups: Group[];
        defaultGroup?: Group;
        smtpEnabled: boolean;
        onSubmit?: (data: { group?: string; email?: string; method: InviteMethod }) => Promise<void> | void;
    }

    const { trigger, groups, defaultGroup, smtpEnabled, onSubmit }: Props = $props();
    const t = getFormatter();

    let open = $state(false);
    let userEmail: string | undefined = $state();
    let selectedGroup: string | undefined = $state(defaultGroup?.id);
    let emailError = $state(false);
    let groupError = $state(false);

    const onFormSubmit = async (method: InviteMethod) => {
        if (selectedGroup && selectedGroup[0] && (method === "link" || !smtpEnabled || userEmail)) {
            onSubmit?.({ group: selectedGroup[0], email: userEmail, method });
            resetForm();
            open = false;
        } else {
            open = true;
            emailError = smtpEnabled && !userEmail;
            groupError = !selectedGroup;
        }
    };

    const collection = $derived(
        useListCollection({
            items: groups,
            itemToString(item) {
                return item.name;
            },
            itemToValue(item) {
                return item.id;
            }
        })
    );

    function resetForm() {
        groupError = false;
        emailError = false;
        userEmail = undefined;
    }
</script>

<BaseModal onOpenChange={(e) => (open = e.open)} {open} title={$t("general.invite-user")} {trigger}>
    {#snippet description()}
        {#if smtpEnabled}
            <span>{$t("general.enter-user-email")}</span>
        {:else}
            <span>{$t("general.select-user-group")}</span>
        {/if}
    {/snippet}

    <div class="flex flex-col gap-2">
        {#if smtpEnabled}
            <label class="label w-fit" for="invite-email">
                <span>{$t("auth.email")}</span>
                <input
                    id="invite-email"
                    name="invite-email"
                    class={["input", emailError && "input-invalid"]}
                    aria-invalid={emailError}
                    autocomplete="off"
                    required
                    bind:value={userEmail}
                />
            </label>
            {#if emailError}
                <span class="text-invalid">Email is required</span>
            {/if}
        {/if}

        {#if groups && groups.length > 0}
            <Listbox aria-invalid={groupError} {collection} onSelect={(e) => (selectedGroup = e.value)}>
                <Listbox.Label class="text-base">{$t("general.group")}</Listbox.Label>
                <Listbox.Content
                    class={[
                        "preset-filled-surface-200-800 preset-outlined-surface-300-700 pt-1",
                        groupError && "input-invalid!"
                    ]}
                >
                    {#each collection.items as item (item.id)}
                        <Listbox.Item {item}>
                            <Listbox.ItemText>
                                {item.name}
                            </Listbox.ItemText>
                            <Listbox.ItemIndicator />
                        </Listbox.Item>
                    {/each}
                </Listbox.Content>
            </Listbox>
            {#if groupError}
                <span class="text-invalid">{$t("errors.must-select-a-group")}</span>
            {/if}
        {/if}
    </div>

    {#snippet actions({ neutralStyle, positiveStyle })}
        <Dialog.CloseTrigger class={neutralStyle} onclick={resetForm}>
            {$t("general.cancel")}
        </Dialog.CloseTrigger>
        {#if smtpEnabled}
            <Popup zIndex="z-60!">
                {#snippet trigger(props)}
                    <button {...props} class={positiveStyle}>{$t("auth.invite-via")}</button>
                {/snippet}
                {#snippet content(props)}
                    <div {...props} class="card preset-filled-surface-100-900 p-4 shadow-xl">
                        <div class="flex flex-row gap-x-4">
                            <button
                                class="preset-tonal-primary border-primary-500 btn border"
                                onclick={() => onFormSubmit("link")}
                            >
                                {$t("general.invite-link")}
                            </button>
                            <button class="preset-filled-primary-500 btn" onclick={() => onFormSubmit("email")}>
                                {$t("auth.email")}
                            </button>
                        </div>
                    </div>
                {/snippet}
            </Popup>
        {:else}
            <Dialog.CloseTrigger class={positiveStyle} onclick={() => onFormSubmit("link")}>
                {$t("general.invite")}
            </Dialog.CloseTrigger>
        {/if}
    {/snippet}
</BaseModal>
