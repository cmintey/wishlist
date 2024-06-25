<script lang="ts">
    import { SystemUsersAPI } from "$lib/api/users";
    import { getModalStore } from "@skeletonlabs/skeleton";

    export let parent: any;

    const modalStore = getModalStore();
    const systemUsersAPI = new SystemUsersAPI();

    let username = "";
    let name = "";

    async function onFormSubmit(): Promise<void> {
        if (username) {
            const resp = await systemUsersAPI.create(username, name === "" ? undefined : name);
            const data = await resp.json();

            if ($modalStore[0].response) $modalStore[0].response(data);
            modalStore.close();
        }
    }
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">Claim Details</header>
    <span>Before you can claim the item, we just need one thing from you.</span>
    <label class="w-fit">
        <span>Email</span>
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="input-group-shim">
                <iconify-icon class="text-lg" icon="ion:person" />
            </div>
            <input class="input" type="text" bind:value={username} />
        </div>
    </label>

    <label class="w-fit">
        <span>Name (optional)</span>
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="input-group-shim">
                <iconify-icon class="text-lg" icon="ion:person" />
            </div>
            <input class="input" type="text" bind:value={name} />
        </div>
    </label>

    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>
            {parent.buttonTextCancel}
        </button>
        <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>OK</button>
    </footer>
</div>
