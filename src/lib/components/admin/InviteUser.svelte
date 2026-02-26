<script lang="ts">
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import type { Group } from "$lib/generated/prisma/client";
    import { fade } from "svelte/transition";
    import { InviteUsersAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "../toaster";
    import InviteUserModal from "../modals/InviteUserModal.svelte";

    interface Props {
        config: Config;
        groups?: Group[];
        defaultGroup?: Group | undefined;
        vertical?: boolean;
    }

    const { config, groups = [], defaultGroup = undefined, vertical = false }: Props = $props();
    const t = getFormatter();

    const inviteUsersAPI = new InviteUsersAPI();

    let url: string | null = $state(null);

    const generateInvite = async (data: { group?: string; email?: string; method: InviteMethod }) => {
        if (data.method === "link") {
            const response = await inviteUsersAPI.invite(data);
            if (response.ok) {
                const respData = await inviteUsersAPI.invite(data).then((resp) => resp.json());
                if (respData.url) {
                    url = respData.url as string;
                }
            } else {
                toaster.error({ description: $t("general.oops") });
            }
            return;
        }
        if (data.method === "email") {
            toaster.promise(
                inviteUsersAPI.invite(data).then(async (resp) => {
                    if (!resp.ok) {
                        const data = await resp.json();
                        throw new Error(data?.message);
                    }
                }),
                {
                    loading: {
                        description: "Sending invite..."
                    },
                    success: {
                        description: $t("general.invite-sent")
                    },
                    error: (err) => {
                        const message = (err as Error).message as string | undefined;
                        return {
                            description: $t("errors.invite-failed-to-send", {
                                values: { errorMessage: message || $t("general.oops") }
                            })
                        };
                    }
                }
            );
        }
    };
</script>

<div class="flex flex-col space-y-4 {vertical ? 'items-center' : 'md:flex-row md:items-end md:space-y-0 md:gap-x-4'}">
    <InviteUserModal {defaultGroup} {groups} onSubmit={generateInvite} smtpEnabled={config.smtp.enable}>
        {#snippet trigger(props)}
            <button {...props} class="preset-filled-primary-500 btn w-fit" type="button">
                <iconify-icon icon="ion:person-add"></iconify-icon>
                <p>{$t("general.invite-user")}</p>
            </button>
        {/snippet}
    </InviteUserModal>

    {#if url}
        <div class={["flex flex-row flex-wrap items-center"]} out:fade>
            <TokenCopy onCopied={() => setTimeout(() => (url = null), 1000)} {url}>
                {$t("general.invite-link")}
            </TokenCopy>
            <span class="subtext text-wrap italic">{$t("general.this-invite-link-is-only-valid-for-one-signup")}</span>
        </div>
    {/if}
</div>
