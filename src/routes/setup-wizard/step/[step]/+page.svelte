<script lang="ts">
    import { fade } from "svelte/transition";
    import { getContext, onMount, setContext } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { steps } from "./steps";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import { getFormatter } from "$lib/i18n";
    import type { RouteParams } from "./$types";
    import { resolve } from "$app/paths";
    import Icon from "$lib/components/Icon.svelte";

    let locked = false;

    interface StepperState {
        current: number;
        total: number;
    }

    const t = getFormatter();
    const submit_ = writable(() => {});
    setContext("submit", submit_);
    const stepperState: Writable<StepperState> = getContext("state");
    const SvelteComponent = $derived(steps[$stepperState.current]);
    let submitting = $state(false);

    onMount(() => {
        $stepperState.total = steps.length;
        $stepperState.current = Number.parseInt((page.params as RouteParams).step) - 1;
    });

    const submit = () => {
        submitting = true;
        $submit_();
    };

    const next = () => {
        submitting = false;
        if ($stepperState.current + 1 < $stepperState.total) {
            $stepperState.current = $stepperState.current + 1;
            goto(`/setup-wizard/step/${$stepperState.current + 1}`);
        }
    };

    const onBack = () => {
        if ($stepperState.current >= 0) {
            $stepperState.current = $stepperState.current - 1;
            goto(`/setup-wizard/step/${$stepperState.current + 1}`);
        }
    };

    $effect(() => {
        if (page.error) submitting = false;
    });
</script>

<div transition:fade>
    <SvelteComponent onSuccess={next} />

    <div class="flex justify-between pt-4">
        <!-- Button: Back -->
        <button class="variant-ghost btn" disabled={$stepperState.current <= 1} onclick={onBack} type="button">
            <Icon icon="ion--arrow-back"></Icon>
            <span>{$t("setup.back")}</span>
        </button>
        {#if $stepperState.current < $stepperState.total - 1}
            <!-- Button: Next -->
            <button class="variant-filled btn" disabled={locked} onclick={submit} type="submit">
                {#if locked}
                    <Icon icon="ion--lock-closed"></Icon>
                {/if}
                {#if submitting}
                    <ProgressRadial width="w-4" />
                {/if}
                <span>{$t("setup.next")}</span>
                <Icon icon="ion--arrow-forward"></Icon>
            </button>
        {:else}
            <!-- Button: Complete -->
            <button
                class="variant-filled-primary btn"
                disabled={locked}
                onclick={() => goto(resolve("/login"), { invalidateAll: true })}
                type="submit"
            >
                {$t("setup.complete")}
            </button>
        {/if}
    </div>
</div>
