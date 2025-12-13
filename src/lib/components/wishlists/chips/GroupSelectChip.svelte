<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { UserAPI } from "$lib/api/users";
    import Icon from "$lib/components/Icon.svelte";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

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
    class="variant-ghost-primary chip flex min-w-0 flex-shrink"
    data-testid="group-select-chip"
    use:popup={menuSettings}
>
    <Icon icon="ion--people"></Icon>
    <div class="truncate">{activeGroup.name}</div>
    <Icon class={["arrow text-xs duration-300 ease-out", menuOpen && "rotate-180"]} icon="ion--caret-down"></Icon>
</button>
<nav class="card list-nav z-10 max-h-96 max-w-full p-4 shadow-xl" data-popup={popupKey}>
    <ul class="max-h-72 overflow-auto">
        {#each groups as group (group.id)}
            <li>
                <button class="list-option w-full justify-between" onclick={() => onSelect(group)}>
                    <span class="max-w-full truncate">{group.name}</span>
                    {#if group.id === activeGroup.id}
                        <Icon icon="ion--checkmark"></Icon>
                    {/if}
                </button>
            </li>
        {/each}
    </ul>
</nav>
