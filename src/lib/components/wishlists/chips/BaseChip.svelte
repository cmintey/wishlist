<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

    export let options: Option[];
    export let defaultOption: Option;
    export let searchParam: string;
    export let directionParam: string | undefined = undefined;
    export let prefix: string | undefined = undefined;

    let filter = $page.url.searchParams.get(searchParam);
    let direction = directionParam ? $page.url.searchParams.get(searchParam) : null;
    let selectedOption: Option = defaultOption;
    if (filter) {
        for (const option of options) {
            if (filter === option.value) {
                if (option.direction) {
                    if (direction && option.direction === direction) {
                        selectedOption = option;
                        break;
                    }
                } else {
                    selectedOption = option;
                    break;
                }
            }
        }
    }

    const popupKey = `${searchParam}-options`;
    let menuOpen = false;
    const menuSettings: PopupSettings = {
        event: "click",
        target: popupKey,
        state: ({ state }) => (menuOpen = state)
    };

    const handleClick = (option: Option) => {
        selectedOption = option;
        const newUrl = new URL($page.url);

        if (option === defaultOption) {
            newUrl.searchParams.delete(searchParam);
            if (directionParam) newUrl.searchParams.delete(directionParam);
        } else {
            newUrl.searchParams.set(searchParam, option.value);
            if (directionParam && option.direction) newUrl.searchParams.set(directionParam, option.direction);
        }

        goto(newUrl, {
            replaceState: true
        });
    };
</script>

<div class="flex flex-row space-x-4 pb-4">
    <span>
        <button
            class="variant-ringed-primary chip"
            class:variant-ghost-primary={selectedOption !== defaultOption}
            use:popup={menuSettings}
        >
            {#if selectedOption.direction === "asc"}
                <iconify-icon icon="ion:arrow-up" />
            {:else if selectedOption.direction === "desc"}
                <iconify-icon icon="ion:arrow-down" />
            {:else if prefix}
                <iconify-icon icon={prefix} />
            {/if}
            <span>{selectedOption.displayValue}</span>
            <iconify-icon
                class="arrow text-xs duration-300 ease-out"
                class:rotate-180={menuOpen}
                icon="ion:caret-down"
            />
        </button>
        <nav class="card list-nav p-4 shadow-xl" data-popup={popupKey}>
            <ul>
                {#each options as option}
                    <li>
                        <button class="list-option w-full" on:click={() => handleClick(option)}>
                            {option.displayValue}
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>
    </span>
</div>
