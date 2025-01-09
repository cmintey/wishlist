<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import type { User } from "@prisma/client";
    import { t } from "svelte-i18n";

    interface Props {
        user: User;
    }

    let { user = $bindable() }: Props = $props();
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
                placeholder={user.name}
                type="text"
                bind:value={user.name}
            />
        </label>

        <label for="username">
            <span>{$t("auth.username")}</span>
            <input
                id="username"
                name="username"
                class="input"
                autocomplete="username"
                placeholder={user.username}
                type="text"
                bind:value={user.username}
            />
        </label>

        <label for="email">
            <span>{$t("auth.email")}</span>
            <input
                id="email"
                name="email"
                class="input"
                autocomplete="email"
                placeholder={user.email}
                type="email"
                bind:value={user.email}
            />
        </label>

        {#if $page.form?.error && $page.form?.errors}
            <ul>
                {#each $page.form.errors as error}
                    <li class="text-xs text-red-500">{error.message}</li>
                {/each}
            </ul>
        {/if}

        <button class="variant-filled-primary btn w-fit" formaction="?/profile" type="submit">
            {$t("general.update")}
        </button>
    </div>
</form>
