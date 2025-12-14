<script lang="ts">
    import { getToastStore, getModalStore } from "@skeletonlabs/skeleton";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import type { Group } from "$lib/generated/prisma/client";
    import { fade } from "svelte/transition";
    import { InviteUsersAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        config: Config;
        groups?: Group[];
        defaultGroup?: Group | undefined;
        vertical?: boolean;
    }

    const { config, groups = [], defaultGroup = undefined, vertical = false }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();
    const toastStore = getToastStore();
    const inviteUsersAPI = new InviteUsersAPI();

    let url: string | null = $state(null);

    const generateInvite = async (data: { group?: string; email?: string; method: InviteMethod }) => {
        const response = await inviteUsersAPI.invite(data);
        if (response.ok) {
            const data = (await response.json()) as { url?: string };
            if (data.url) {
                url = data.url;
            } else {
                toastStore.trigger({
                    message: $t("general.invite-sent"),
                    background: "variant-filled-success",
                    autohide: true,
                    timeout: 3000
                });
            }
        } else {
            const data = (await response.json()) as { message: string };
            toastStore.trigger({
                message: $t("errors.invite-failed-to-send", { values: { errorMessage: data.message } }),
                background: "variant-filled-error",
                autohide: true,
                timeout: 3000
            });
        }
    };

    const triggerInviteModal = async () => {
        if (!config.smtp.enable && groups.length === 0 && defaultGroup) {
            return await generateInvite({ group: defaultGroup.id, method: "link" });
        }

        modalStore.trigger({
            type: "component",
            component: "inviteUser",
            meta: {
                groups,
                defaultGroup,
                smtpEnabled: config.smtp.enable
            },
            async response(data?: { group?: string; email?: string; method: InviteMethod }) {
                if (data) await generateInvite(data);
            },
            buttonTextCancel: $t("general.cancel")
        });
    };
</script>

<div class="flex flex-col space-y-4 {vertical ? 'items-center' : 'md:flex-row md:items-end md:gap-x-4 md:space-y-0'}">
    <button class="variant-filled-primary btn w-fit" onclick={triggerInviteModal} type="button">
        <iconify-icon icon="ion:person-add"></iconify-icon>
        <p>{$t("general.invite-user")}</p>
    </button>

    {#if url}
        <div
            class="flex flex-col space-y-2 {vertical
                ? 'items-center'
                : 'md:flex-row md:items-center md:gap-x-2 md:space-y-0'}"
            out:fade
        >
            <TokenCopy onCopied={() => setTimeout(() => (url = null), 1000)} {url}>
                {$t("general.invite-link")}
            </TokenCopy>
            <span class="text-sm italic">{$t("general.this-invite-link-is-only-valid-for-one-signup")}</span>
        </div>
    {/if}
</div>
