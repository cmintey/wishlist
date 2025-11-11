<script lang="ts">
    import { enhance } from "$app/forms";
    import { General } from "$lib/components/admin/Settings";
    import { getToastStore, ProgressRadial } from "@skeletonlabs/skeleton";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { page } from "$app/state";

    const { data }: PageProps = $props();
    const t = getFormatter();

    const config = $state(data.config);
    const toastStore = getToastStore();

    let saving = $state(false);
</script>

<form
    method="POST"
    use:enhance={({ formData }) => {
        saving = true;
        if (!config.enableDefaultListCreation) {
            formData.append("enableDefaultListCreation", "");
        }

        return ({ result }) => {
            saving = false;
            if (result.type === "success") {
                toastStore.trigger({ message: $t("admin.settings-saved-toast") });
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
        <button class="variant-filled-primary btn" disabled={saving} type="submit">
            {#if saving}
                <ProgressRadial stroke={64} width="w-6" />
            {/if}
            <span>{$t("general.save")}</span>
        </button>
    </div>
</form>
