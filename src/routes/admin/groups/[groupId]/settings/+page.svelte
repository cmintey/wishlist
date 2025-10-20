<script lang="ts">
    import { enhance } from "$app/forms";
    import { General } from "$lib/components/admin/Settings";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { page } from "$app/state";
    import { toaster } from "$lib/components/toaster";

    const { data }: PageProps = $props();
    const t = getFormatter();

    const config = $state(data.config);
</script>

<form
    method="POST"
    use:enhance={({ formData }) => {
        if (!config.enableDefaultListCreation) {
            formData.append("enableDefaultListCreation", "");
        }

        return ({ result }) => {
            if (result.type === "success") {
                toaster.info({ description: $t("admin.settings-saved-toast") });
            }
        };
    }}
>
    <General
        {config}
        forGroup
        groupUserCount={data.membershipCount}
        groups={[]}
        hidden={false}
        listCount={data.listCount}
    />

    {#if page.form?.error}
        <span>{page.form.error}</span>
    {/if}

    <div class="flex w-full flex-row justify-end pt-6">
        <button class="preset-filled-primary-500 btn" type="submit">
            {$t("general.save")}
        </button>
    </div>
</form>
