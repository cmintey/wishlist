<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import PasswordInput from "../PasswordInput.svelte";
    import { getFormatter } from "$lib/i18n";

    const t = getFormatter();
    const toastStore = getToastStore();

    let passwordReset = $state({
        current: "",
        new: "",
        confirm: ""
    });
</script>

<form
    method="POST"
    use:enhance={() => {
        return async ({ result, update }) => {
            if (result.type === "success") {
                const toastSettings = {
                    message: $t("auth.password-updated-successfully"),
                    autohide: true,
                    timeout: 5000
                };

                passwordReset.current = "";
                toastStore.trigger(toastSettings);
            }

            passwordReset.new = "";
            passwordReset.confirm = "";
            update();
        };
    }}
>
    <div class="flex flex-col items-start space-y-4">
        <h3 class="h3">Credentials</h3>
        <PasswordInput
            id="oldpassword"
            name="oldPassword"
            autocomplete="current-password"
            label={$t("auth.current-password")}
            bind:value={passwordReset.current}
        />
        <div>
            <PasswordInput
                id="newpassword"
                autocomplete="new-password"
                label={$t("auth.new-password")}
                strengthMeter
                bind:value={passwordReset.new}
            />
        </div>

        <PasswordInput
            id="confirmpassword"
            name="newPassword"
            autocomplete="new-password"
            label={$t("auth.confirm-password")}
            bind:value={passwordReset.confirm}
        />
        {#if passwordReset.new !== passwordReset.confirm}
            <span class="unstyled text-xs text-red-500">{$t("auth.passwords-must-match")}</span>
        {/if}
        {#if page.form?.error && page.form?.errors}
            <ul>
                {#each page.form.errors as error}
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
        <label class="checkbox-label">
            <input id="invalidateSessions" name="invalidateSessions" class="checkbox" type="checkbox" />
            <span>{$t("auth.sign-out-of-all-devices")}</span>
        </label>
        <button
            class="variant-filled-primary btn w-fit"
            disabled={passwordReset.current === "" ||
                passwordReset.new === "" ||
                passwordReset.new !== passwordReset.confirm}
            formaction="?/passwordchange"
            type="submit"
        >
            {$t("auth.update-password")}
        </button>
    </div>
</form>
