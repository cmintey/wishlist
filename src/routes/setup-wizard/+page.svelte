<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { getFormatter } from "$lib/i18n";

    const t = getFormatter();
    let introStep = $state(0);
    let getStarted = false;
    let statements = [$t("setup.hi"), $t("setup.welcome-to-wishlist"), $t("setup.lets-get-started")];

    onMount(() => {
        const incrementStep = () =>
            setTimeout(() => {
                introStep++;
                if (introStep < statements.length - 1) {
                    incrementStep();
                }
            }, 4000);

        incrementStep();
    });
</script>

{#if !getStarted}
    <div
        class="fixed bottom-0 left-0 right-0 top-0 flex h-screen w-full flex-col items-center justify-center space-y-4 overflow-hidden"
    >
        {#key statements[introStep]}
            <h1 class="h1" in:fade>
                {statements[introStep]}
            </h1>
            <button
                style:visibility={introStep < 2 ? "hidden" : ""}
                class="variant-filled-primary btn"
                onclick={() => goto("setup-wizard/step/1")}
                type="button"
                in:fade={{ delay: 1200 }}
            >
                {$t("setup.get-started")}
            </button>
        {/key}
    </div>
{:else}
    <div transition:fade>
        <div class="flex flex-col items-center space-y-4">
            <h1 class="h1">{$t("setup.create-your-account")}</h1>
            <span>{$t("setup.first-account-admin")}</span>
        </div>
    </div>
{/if}
