<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        user: LocalUser;
        disabled: boolean;
    }

    let { user, disabled }: Props = $props();
    const t = getFormatter();
</script>

<form method="POST" use:enhance>
    <div class="flex flex-col space-y-4">
        <label for="name">
            <span>{$t("auth.name")}</span>
            <input
                id="name"
                name="name"
                class="input"
                autocomplete="name"
                {disabled}
                placeholder={user.name}
                type="text"
                value={user.name}
            />
            {#if page.form?.errors?.name}
                <span class="text-xs text-red-500">{page.form?.errors?.name[0]}</span>
            {/if}
        </label>

        <label for="username">
            <span>{$t("auth.username")}</span>
            <input
                id="username"
                name="username"
                class="input"
                autocomplete="username"
                {disabled}
                placeholder={user.username}
                type="text"
                value={user.username}
            />
            {#if page.form?.errors?.username}
                <span class="text-xs text-red-500">{page.form?.errors?.username[0]}</span>
            {/if}
        </label>

        <label for="email">
            <span>{$t("auth.email")}</span>
            <input
                id="email"
                name="email"
                class="input"
                autocomplete="email"
                {disabled}
                placeholder={user.email}
                type="email"
                value={user.email}
            />
            {#if page.form?.errors?.email}
                <span class="text-xs text-red-500">{page.form?.errors?.email[0]}</span>
            {/if}
        </label>

        {#if disabled}
            <span>{$t("admin.profile-disabled")}</span>
        {/if}

        <button class="variant-filled-primary btn w-fit" {disabled} formaction="?/profile" type="submit">
            {$t("general.update")}
        </button>
    </div>
</form>
