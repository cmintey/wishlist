<script lang="ts">
    import ChangePassword from "$lib/components/account/ChangePassword.svelte";
    import EditProfile from "$lib/components/account/EditProfile.svelte";
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import type { PageProps } from "./$types";
    import LinkOAuth from "$lib/components/account/LinkOAuth.svelte";
    import { getFormatter } from "$lib/i18n";

    let { data }: PageProps = $props();
    const t = getFormatter();

    const profileEditDisabled = $derived(
        data.oidcConfig.ready && data.oidcConfig.enableSync === true && data.user.oauthId !== null
    );
</script>

<Tabs defaultValue="profile">
    <Tabs.List class="flex overflow-auto">
        <Tabs.Trigger value="profile">{$t("admin.profile")}</Tabs.Trigger>
        <Tabs.Trigger value="security">{$t("admin.security")}</Tabs.Trigger>
        <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Content value="profile">
        <EditProfile disabled={profileEditDisabled} user={data.user} />
    </Tabs.Content>

    <Tabs.Content class="grid grid-cols-1 gap-4 md:grid-cols-2" value="security">
        {#if !(data.isProxyUser || (data.oidcConfig.ready && data.user.oauthId))}
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
