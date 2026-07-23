<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import { FileUpload } from "@skeletonlabs/skeleton-svelte";
    import Avatar from "../Avatar.svelte";
    import { toaster } from "../toaster";
    import Label from "../Label.svelte";
    import Input from "../Input.svelte";

    interface Props {
        user: Pick<LocalUser, "name" | "username" | "email" | "picture">;
        disabled: boolean;
        autocomplete?: boolean;
    }

    let { user, disabled, autocomplete = true }: Props = $props();
    const t = getFormatter();

    let submitButton: HTMLElement | undefined = $state();
</script>

<div
    class="card preset-filled-surface-100-900 inset-ring-surface-200-800 flex w-full min-w-96 flex-col gap-1 p-4 inset-ring md:max-w-1/3"
>
    <div class="relative m-auto h-full w-full max-w-37.5">
        <Avatar class="size-32 text-3xl" {user} />
        <form
            class="absolute right-0 bottom-0 h-12 w-12"
            action="?/profilePicture"
            enctype="multipart/form-data"
            method="POST"
            use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === "error") {
                        toaster.error({ description: (result.error?.message as string) || $t("general.oops") });
                        return;
                    }
                    toaster.info({ description: "Profile photo uploaded" });
                    update({ invalidateAll: true });
                };
            }}
        >
            <FileUpload name="profilePic" accept="image/*" onFileAccept={() => submitButton?.click()}>
                <FileUpload.Trigger class="btn-icon preset-tonal-secondary" title={$t("a11y.upload-profile-image")}>
                    <iconify-icon class="text-lg" icon="ion:camera"></iconify-icon>
                    <span class="sr-only">{$t("a11y.upload-profile-image")}</span>
                </FileUpload.Trigger>
                <FileUpload.HiddenInput />
            </FileUpload>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button bind:this={submitButton} hidden type="submit"></button>
        </form>
    </div>

    <form
        method="POST"
        use:enhance={() => {
            return async ({ result, update }) => {
                if (result.type === "failure") {
                    toaster.error({ description: (result.data?.message as string) || $t("general.oops") });
                    return;
                }

                toaster.info({ description: "Profile info updated" });
                update({ invalidateAll: true });
            };
        }}
    >
        <div class="flex flex-col gap-4">
            <Label value={$t("auth.name")}>
                <Input
                    id="name"
                    name="name"
                    autocomplete={autocomplete ? "name" : "off"}
                    {disabled}
                    error={page.form?.errors?.name?.[0]}
                    icon="ion:id-card"
                    placeholder={user.name}
                    type="text"
                    value={user.name}
                />
            </Label>

            <Label value={$t("auth.username")}>
                <Input
                    name="username"
                    autocomplete={autocomplete ? "username" : "off"}
                    {disabled}
                    error={page.form?.errors?.username?.[0]}
                    icon="ion:person"
                    placeholder={user.username}
                    type="text"
                    value={user.username}
                />
            </Label>

            <Label value={$t("auth.email")}>
                <Input
                    name="email"
                    autocomplete={autocomplete ? "email" : "off"}
                    {disabled}
                    error={page.form?.errors?.email?.[0]}
                    icon="ion:person"
                    placeholder={user.email}
                    type="text"
                    value={user.email}
                />
            </Label>

            {#if disabled}
                <span>{$t("admin.profile-disabled")}</span>
            {/if}

            <button class="preset-filled-primary-500 btn w-fit" {disabled} formaction="?/profile" type="submit">
                {$t("general.update")}
            </button>
        </div>
    </form>
</div>
