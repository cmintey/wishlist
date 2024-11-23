<script lang="ts">
    import { fade } from "svelte/transition";
    import { getContext, onMount, setContext } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { steps } from "./steps";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t } from "svelte-i18n";

    let locked = false;

    interface StepperState {
        current: number;
        total: number;
    }

    const submit = writable(() => {});
    setContext("submit", submit);
    const state: Writable<StepperState> = getContext("state");
    const SvelteComponent = $derived(steps[$state.current]);

    onMount(() => {
        $state.total = steps.length;
        $state.current = Number.parseInt($page.params.step) - 1;
    });

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
    <SvelteComponent onSuccess={next} />

    <div class="flex justify-between pt-4">
        <!-- Button: Back -->
        <button class="variant-ghost btn" disabled={$state.current <= 1} onclick={onBack} type="button">
            <iconify-icon icon="ion:arrow-back"></iconify-icon>
            <span>{$t("setup.back")}</span>
        </button>
        {#if $state.current < $state.total - 1}
            <!-- Button: Next -->
            <button class="variant-filled btn" disabled={locked} onclick={$submit} type="submit">
                {#if locked}
                    <iconify-icon icon="ion:lock-closed"></iconify-icon>
                {/if}
                <span>{$t("setup.next")}</span>
                <iconify-icon icon="ion:arrow-forward"></iconify-icon>
            </button>
        {:else}
            <!-- Button: Complete -->
            <button
                class="variant-filled-primary btn"
                disabled={locked}
                onclick={() => goto("/login", { invalidateAll: true })}
                type="submit"
            >
                {$t("setup.complete")}
            </button>
        {/if}
    </div>
</div>
