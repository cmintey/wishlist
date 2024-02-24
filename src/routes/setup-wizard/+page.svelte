<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let getStarted = false;
    let introStep = 0;
    let statements = ["Hi!", "Welcome to Wishlist", "Let's get started"];

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
                type="button"
                on:click={() => goto("setup-wizard/step/1")}
                in:fade={{ delay: 1200 }}
            >
                Get Started
            </button>
        {/key}
    </div>
{:else}
    <div transition:fade>
        <div class="flex flex-col items-center space-y-4">
            <h1 class="h1">Create your account</h1>
            <span>Your first account will be the administrator. You can always add more admins later.</span>
        </div>
    </div>
{/if}
