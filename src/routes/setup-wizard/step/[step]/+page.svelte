<script lang="ts">
    import { fade } from "svelte/transition";
    import { getContext, setContext } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { steps } from "./steps";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    interface StepperState {
        current: number;
        total: number;
    }

    const currentStep = Number.parseInt($page.params.step) - 1;

    const state: Writable<StepperState> = getContext("state");
    $state.total = steps.length;
    $state.current = currentStep;

    let locked = false;

    const submit = writable(() => {});
    setContext("submit", submit);

    const onSubmit = () => {
        $submit();
        if (!$page.form?.error && currentStep + 1 < $state.total) {
            goto(`/setup-wizard/step/${currentStep + 1}`);
        }
    };

    const onComplete = () => {
        $submit();
        if (!$page.form?.error && currentStep + 1 === $state.total) {
            goto(`/login`);
        }
    };

    const onBack = () => {
        if (currentStep - 1 >= 0) {
            goto(`/setup-wizard/step/${currentStep - 1}`);
        }
    };
</script>

<div transition:fade>
    <svelte:component this={steps[$state.current]} />

    <div class="flex justify-between pt-4">
        <!-- Button: Back -->
        <button class="variant-ghost btn" disabled={$state.current === 0} type="button" on:click={onBack}>Back</button>
        {#if currentStep < $state.total - 1}
            <!-- Button: Next -->
            <button class="variant-filled btn" disabled={locked} type="submit" on:click={onSubmit}>
                {#if locked}
                    <svg
                        class="aspect-square w-3 fill-current"
                        viewBox="0 0 448 512"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"
                        />
                    </svg>
                {/if}
                <span>Next</span>
            </button>
        {:else}
            <!-- Button: Complete -->
            <button class="variant-filled-primary btn" disabled={locked} type="submit" on:click={onComplete}>
                Complete
            </button>
        {/if}
    </div>
</div>
