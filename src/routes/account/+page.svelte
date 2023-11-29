<script lang="ts">
    import { enhance } from "$app/forms";
    import ChangePassword from "$lib/components/account/ChangePassword.svelte";
    import EditProfile from "$lib/components/account/EditProfile.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import { FileButton, Tab, TabGroup } from "@skeletonlabs/skeleton";
    import type { PageServerData } from "./$types";

    export let data: PageServerData;

    let submitButton: HTMLElement;

    let tabSet = 0;
</script>

<TabGroup>
    <Tab name="Profile" value={0} bind:group={tabSet}>Profile</Tab>
    <Tab name="Security" value={1} bind:group={tabSet}>Security</Tab>
    <svelte:fragment slot="panel">
        {#if tabSet === 0}
            <div class="flex w-fit flex-col items-center">
                <div class="relative m-auto h-full w-full max-w-[150px]">
                    <Avatar user={data.user} width="w-32" />
                    <form
                        class="absolute bottom-0 right-0 h-12 w-12"
                        action="?/profilePicture"
                        method="POST"
                        use:enhance
                    >
                        <FileButton
                            id="profilePic"
                            name="profilePic"
                            accept="image/*"
                            button="btn-icon btn-icon-sm variant-glass-secondary"
                            on:change={() => submitButton.click()}
                        >
                            <iconify-icon class="text-2xl" icon="ion:camera" />
                        </FileButton>
                        <button bind:this={submitButton} type="submit" />
                    </form>
                </div>

                <EditProfile user={data.user} />
            </div>
        {:else if tabSet === 1}
            <ChangePassword />
        {/if}
    </svelte:fragment>
</TabGroup>

<svelte:head>
    <title>Account</title>
</svelte:head>
