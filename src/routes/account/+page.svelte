<script lang="ts">
    import { enhance } from "$app/forms";
    import ChangePassword from "$lib/components/account/ChangePassword.svelte";
    import EditProfile from "$lib/components/account/EditProfile.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import { FileUpload, Tabs } from "@skeletonlabs/skeleton-svelte";
    import type { PageProps } from "./$types";
    import LinkOAuth from "$lib/components/account/LinkOAuth.svelte";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";

    const { data }: PageProps = $props();
    const t = getFormatter();

    let submitButton: HTMLElement | undefined = $state();
</script>

<Tabs>
    <Tabs.List>
        <Tabs.Trigger value="profile">{$t("admin.profile")}</Tabs.Trigger>
        <Tabs.Trigger value="security">{$t("admin.security")}</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content class="flex w-fit flex-col items-center" value="profile">
        <div class="relative m-auto h-full w-full max-w-[150px]">
            <Avatar class="size-32" user={data.user} />
            <form
                class="absolute right-0 bottom-0 h-12 w-12"
                action="?/profilePicture"
                enctype="multipart/form-data"
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "error") {
                            toaster.error({ description: (result.error?.message as string) || $t("general.oops") });
                            return;
                        }
                    };
                }}
            >
                <FileUpload name="profilePic" accept="image/*" onFileAccept={() => submitButton?.click()}>
                    <FileUpload.Trigger class="btn-icon btn-icon-sm preset-tonal-secondary">
                        <iconify-icon class="text-2xl" icon="ion:camera"></iconify-icon>
                        <span class="sr-only">{$t("a11y.upload-profile-image")}</span>
                    </FileUpload.Trigger>
                    <FileUpload.HiddenInput />
                </FileUpload>
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button bind:this={submitButton} hidden type="submit"></button>
            </form>
        </div>

        <EditProfile user={data.user} />
    </Tabs.Content>

    <Tabs.Content class="grid grid-cols-1 gap-4 md:grid-cols-2" value="security">
        {#if !data.isProxyUser}
            <ChangePassword />
        {/if}
        {#if data.oidcConfig.ready}
            <LinkOAuth oauthId={data.user.oauthId} providerName={data.oidcConfig.providerName} />
        {/if}
    </Tabs.Content>
</Tabs>

<svelte:head>
    <title>{$t("admin.account")}</title>
</svelte:head>
