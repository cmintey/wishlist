<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import PasswordInput from "../PasswordInput.svelte";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "../toaster";

    const t = getFormatter();

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
                passwordReset.current = "";
                toaster.info({ description: $t("auth.password-updated-successfully") });
            }

            passwordReset.new = "";
            passwordReset.confirm = "";
            update();
        };
    }}
>
    <div class="flex flex-col items-start space-y-4">
        <h3 class="h3">Credentials</h3>
        <div class="flex space-y-1">
            <PasswordInput
                id="oldpassword"
                name="oldPassword"
                autocomplete="current-password"
                label={$t("auth.current-password")}
                bind:value={passwordReset.current}
            />
            {#if page.form?.errors?.oldPassword}
                <span class="text-xs text-red-500">{page.form?.errors?.oldPassword[0]}</span>
            {/if}
        </div>

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
        {#if page.form?.errors?.newPassword}
            <span class="text-xs text-red-500">{page.form?.errors?.newPassword[0]}</span>
        {/if}

        <label class="checkbox-label">
            <input id="invalidateSessions" name="invalidateSessions" class="checkbox" type="checkbox" />
            <span>{$t("auth.sign-out-of-all-devices")}</span>
        </label>

        <button
            class="preset-filled-primary-500 btn w-fit"
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
