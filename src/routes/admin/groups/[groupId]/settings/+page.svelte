<script lang="ts">
    import { enhance } from "$app/forms";
    import { General } from "$lib/components/admin/Settings";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";

    const { data }: PageProps = $props();
    const t = getFormatter();

    const config = $state(data.config);
    const toastStore = getToastStore();
</script>

<form
    method="POST"
    use:enhance={({ formData }) => {
        if (!config.enableDefaultListCreation) {
            formData.append("enableDefaultListCreation", "");
        }

        return ({ result }) => {
            if (result.type === "success") {
                toastStore.trigger({ message: $t("admin.settings-saved-toast") });
            } else if (result.type === "failure" && result.data?.error && typeof result.data.error === "string") {
                toastStore.trigger({ message: result.data.error, background: "variant-filled-error" });
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

    <div class="flex w-full flex-row justify-end pt-6">
        <button class="variant-filled-primary btn" type="submit">
            {$t("general.save")}
        </button>
    </div>
</form>
