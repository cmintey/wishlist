<script lang="ts">
    import { fade } from "svelte/transition";
    import { getContext, onMount, setContext } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { steps } from "./steps";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let locked = false;

    interface StepperState {
        current: number;
        total: number;
    }

    const state: Writable<StepperState> = getContext("state");

    onMount(() => {
        $state.total = steps.length;
        $state.current = Number.parseInt($page.params.step) - 1;
    });

    const submit = writable(() => {});
    setContext("submit", submit);

    $: if ($page.form?.success) next();

    const next = () => {
        if ($state.current + 1 < $state.total) {
            $state.current = $state.current + 1;
            goto(`/setup-wizard/step/${$state.current + 1}`);
        }
    };

    const onBack = () => {
        if ($state.current >= 0) {
            $state.current = $state.current - 1;
            goto(`/setup-wizard/step/${$state.current + 1}`);
        }
    };
</script>

<div transition:fade>
    <svelte:component this={steps[$state.current]} />

    <div class="flex justify-between pt-4">
        <!-- Button: Back -->
        <button class="variant-ghost btn" disabled={$state.current <= 1} type="button" on:click={onBack}>
            <iconify-icon icon="ion:arrow-back"></iconify-icon>
            <span>Back</span>
        </button>
        {#if $state.current < $state.total - 1}
            <!-- Button: Next -->
            <button class="variant-filled btn" disabled={locked} type="submit" on:click={$submit}>
                {#if locked}
                    <iconify-icon icon="ion:lock-closed"></iconify-icon>
                {/if}
                <span>Next</span>
                <iconify-icon icon="ion:arrow-forward"></iconify-icon>
            </button>
        {:else}
            <!-- Button: Complete -->
            <button
                class="variant-filled-primary btn"
                disabled={locked}
                type="submit"
                on:click={() => goto("/login", { invalidateAll: true })}
            >
                Complete
            </button>
        {/if}
    </div>
</div>
