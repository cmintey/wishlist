<script lang="ts">
    import { enhance } from "$app/forms";
    import ChangePassword from "$lib/components/account/ChangePassword.svelte";
    import EditProfile from "$lib/components/account/EditProfile.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import { FileButton, getToastStore, Tab } from "@skeletonlabs/skeleton";
    import type { PageProps } from "./$types";
    import TabGroup from "$lib/components/Tab/TabGroup.svelte";
    import LinkOAuth from "$lib/components/account/LinkOAuth.svelte";
    import { getFormatter } from "$lib/i18n";
    import { errorToast } from "$lib/components/toasts";

    const { data }: PageProps = $props();
    const t = getFormatter();
    const toastStore = getToastStore();

    let submitButton: HTMLElement | undefined = $state();

    let tabSet = $state(0);
</script>

<TabGroup>
    <Tab name="Profile" value={0} bind:group={tabSet}>{$t("admin.profile")}</Tab>
    {#if !data.isProxyUser}
        <Tab name="Security" value={1} bind:group={tabSet}>{$t("admin.security")}</Tab>
    {/if}
    {#snippet panel()}
        {#if tabSet === 0}
            <div class="flex w-fit flex-col items-center">
                <div class="relative m-auto h-full w-full max-w-[150px]">
                    <Avatar user={data.user} width="w-32" />
                    <form
                        class="absolute bottom-0 right-0 h-12 w-12"
                        action="?/profilePicture"
                        enctype="multipart/form-data"
                        method="POST"
                        use:enhance={() => {
                            return async ({ result }) => {
                                if (result.type === "error") {
                                    errorToast(toastStore, (result.error?.message as string) || $t("general.oops"));
                                    return;
                                }
                            };
                        }}
                    >
                        <FileButton
                            id="profilePic"
                            name="profilePic"
                            accept="image/*"
                            aria-label={$t("a11y.upload-profile-image")}
                            button="btn-icon btn-icon-sm variant-glass-secondary"
                            on:change={() => submitButton?.click()}
                        >
                            <iconify-icon class="text-2xl" icon="ion:camera"></iconify-icon>
                        </FileButton>
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <button bind:this={submitButton} hidden type="submit"></button>
                    </form>
                </div>

                <EditProfile user={data.user} />
            </div>
        {:else if tabSet === 1 && !data.isProxyUser}
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                {#if !data.isProxyUser}
                    <ChangePassword />
                {/if}
                {#if data.oidcConfig.ready}
                    <LinkOAuth oauthId={data.user.oauthId} providerName={data.oidcConfig.providerName} />
                {/if}
            </div>
        {/if}
    {/snippet}
</TabGroup>

<svelte:head>
    <title>{$t("admin.account")}</title>
</svelte:head>
