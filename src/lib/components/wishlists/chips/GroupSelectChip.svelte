<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { UserAPI } from "$lib/api/users";
    import { type PopupSettings } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        user: LocalUser;
        groups: GroupInformation[];
    }

    const { user, groups }: Props = $props();

    const popupKey = "group-select-options";
    let menuOpen = $state(false);
    const menuSettings: PopupSettings = {
        event: "click",
        target: popupKey,
        state: ({ state }) => (menuOpen = state)
    };

    const userAPI = new UserAPI(user.id);

    const onSelect = async (group: GroupInformation) => {
        if (group.active) return;
        await userAPI.setActiveGroup(group.id);
        await goto(resolve("/lists"), { invalidateAll: true });
    };

    const activeGroup = $derived(groups.find((group) => group.active)!);
</script>

<button
    class="preset-tonal-primary border border-primary-500 chip flex min-w-0 shrink"
    data-testid="group-select-chip"
    use:popup={menuSettings}
>
    <iconify-icon icon="ion:people"></iconify-icon>
    <div class="truncate">{activeGroup.name}</div>
    <iconify-icon
        class="arrow text-xs duration-300 ease-out"
        class:rotate-180={menuOpen}
        icon="ion:caret-down"
    ></iconify-icon>
</button>
<nav class="card list-nav z-10 max-h-96 max-w-full p-4 shadow-xl" data-popup={popupKey}>
    <ul class="max-h-72 overflow-auto">
        {#each groups as group (group.id)}
            <li>
                <button class="list-option w-full justify-between" onclick={() => onSelect(group)}>
                    <span class="max-w-full truncate">{group.name}</span>
                    {#if group.id === activeGroup.id}
                        <iconify-icon icon="ion:checkmark"></iconify-icon>
                    {/if}
                </button>
            </li>
        {/each}
    </ul>
</nav>
