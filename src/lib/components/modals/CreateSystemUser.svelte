<script lang="ts">
    import { SystemUsersAPI } from "$lib/api/users";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import { t } from "svelte-i18n";

    interface Props {
        parent: any;
    }

    let { parent }: Props = $props();

    const modalStore = getModalStore();
    const systemUsersAPI = new SystemUsersAPI();

    let requireClaimEmail = $modalStore[0].meta.requireClaimEmail;
    let username = $state("");
    let name = $state("");

    async function onFormSubmit(): Promise<void> {
        if (requireClaimEmail && username) {
            const resp = await systemUsersAPI.create(username, name);
            const data = await resp.json();

            if ($modalStore[0].response) $modalStore[0].response(data);
            modalStore.close();
        } else if (!requireClaimEmail && name) {
            const resp = await systemUsersAPI.create("anon", name);
            const data = await resp.json();

            if ($modalStore[0].response) $modalStore[0].response(data);
            modalStore.close();
        }
    }
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">{$t("wishes.claim-details")}</header>
    <span>{$t("wishes.before-you-can-claim-the-item-we-just-need-one-thing-from-you")}</span>
    <!-- TODO: <span>{$t("general.name-optional")}</span> name optional should be labeled in emails. -->
    {#if requireClaimEmail}
        <label class="w-fit"><span>{$t("auth.email")}</span>
            <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="input-group-shim">
                    <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
                </div>
                <input class="input" type="text" bind:value={username}/>
            </div>
        </label>
    {/if}
    <label class="w-fit">
        <span>{$t("auth.name")}</span>
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="input-group-shim">
                <iconify-icon class="text-lg" icon="ion:person"></iconify-icon>
            </div>
            <input class="input" type="text" bind:value={name} />
        </div>
    </label>

    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" onclick={parent.onClose}>
            {parent.buttonTextCancel}
        </button>
        <button class="btn {parent.buttonPositive}" onclick={onFormSubmit}>{$t("wishes.claim")}</button>
    </footer>
</div>
