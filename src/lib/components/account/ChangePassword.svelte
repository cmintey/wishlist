<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import PasswordInput from "../PasswordInput.svelte";

    const toastStore = getToastStore();

    let passwordReset = {
        current: "",
        new: "",
        confirm: ""
    };
</script>

<form
    method="POST"
    use:enhance={() => {
        return async ({ result, update }) => {
            if (result.type === "success") {
                const t = {
                    message: "Password updated successfully",
                    autohide: true,
                    timeout: 5000
                };

                passwordReset.current = "";
                toastStore.trigger(t);
            }

            passwordReset.new = "";
            passwordReset.confirm = "";
            update();
        };
    }}
>
    <div class="flex flex-col items-start space-y-4">
        <PasswordInput
            id="oldpassword"
            name="oldPassword"
            autocomplete="current-password"
            label="Current Password"
            bind:value={passwordReset.current}
        />
        <div>
            <PasswordInput
                id="newpassword"
                autocomplete="new-password"
                label="New Password"
                strengthMeter
                bind:value={passwordReset.new}
            />
        </div>

        <PasswordInput
            id="confirmpassword"
            name="newPassword"
            autocomplete="new-password"
            label="Confirm Password"
            bind:value={passwordReset.confirm}
        />
        {#if passwordReset.new !== passwordReset.confirm}
            <span class="unstyled text-xs text-red-500">Passwords must match</span>
        {/if}
        {#if $page.form?.error && $page.form?.errors}
            <ul>
                {#each $page.form.errors as error}
                    {#if error.field === "newPassword"}
                        {#each error.message.split("\n") as message}
                            <li class="text-xs text-red-500">{message}</li>
                        {/each}
                    {:else}
                        <li class="text-xs text-red-500">{error.message}</li>
                    {/if}
                {/each}
            </ul>
        {/if}
        <button
            class="variant-filled-primary btn w-fit"
            disabled={passwordReset.current === "" ||
                passwordReset.new === "" ||
                passwordReset.new !== passwordReset.confirm}
            formaction="?/passwordchange"
            type="submit"
        >
            Update Password
        </button>
    </div>
</form>
