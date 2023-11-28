<script lang="ts">
    import { zxcvbn, zxcvbnOptions, type ZxcvbnResult } from "@zxcvbn-ts/core";
    import { loadOptions } from "$lib/zxcvbn";
    import { popup, ProgressBar, type PopupSettings } from "@skeletonlabs/skeleton";
    import { onMount } from "svelte";

    export let id: string;
    export let name: string | undefined = undefined;
    export let label: string;
    export let required = false;
    export let autocomplete: string | null | undefined = undefined;
    export let error = false;
    export let value: string | null | undefined = "";
    export let strengthMeter = false;

    onMount(async () => {
        if (strengthMeter) {
            const options = await loadOptions();
            zxcvbnOptions.setOptions(options);
        }
    });

    let strength: ZxcvbnResult | undefined;
    $: strength = value ? zxcvbn(value) : undefined;

    let visible = false;

    const handleClick = () => {
        visible = !visible;
    };

    const meterLookup = ["bg-error-500", "bg-error-500", "bg-error-500", "bg-warning-500", "bg-success-500"];

    const popupSettings: PopupSettings = {
        event: "hover",
        target: "suggestions",
        placement: "right"
    };
</script>

<label for={id}>
    <span>{label}</span>
    <div class="input-group grid-cols-[1fr_auto]">
        <input
            {id}
            {name}
            class="input"
            class:input-error={error}
            {autocomplete}
            {required}
            type={visible ? "text" : "password"}
            {value}
            on:input={(e) => (value = e.currentTarget.value)}
            {...$$props}
        />
        <button
            id="showpassword"
            tabindex="-1"
            type="button"
            on:click|preventDefault={handleClick}
            on:keypress|preventDefault
        >
            <iconify-icon class="-mb-0.5" icon="ion:{visible ? 'eye-off' : 'eye'}" />
        </button>
    </div>
</label>

{#if strengthMeter && value !== "" && strength}
    <div class="flex flex-row items-center space-x-1 pt-1">
        <ProgressBar
            label="Password Strength"
            max={5}
            value={strength.score + 1}
            bind:meter={meterLookup[strength.score.valueOf()]}
        />
        <div
            class="flex items-center"
            class:hidden={strength.feedback.suggestions.length === 0 && !strength.feedback.warning}
            use:popup={popupSettings}
        >
            <iconify-icon icon="ion:information-circle-outline" />
        </div>
    </div>

    <div class="card variant-filled p-4" data-popup="suggestions">
        {#if strength.feedback.warning}
            <div class="flex flex-row items-center space-x-4 pb-1">
                <iconify-icon icon="ion:alert-circle" />
                <p>{strength.feedback.warning}</p>
            </div>
        {/if}
        <ul class="list">
            {#each strength.feedback.suggestions as suggestion}
                <li>
                    <iconify-icon icon="ion:arrow-forward" />
                    <p>{suggestion}</p>
                </li>
            {/each}
        </ul>
    </div>

    {#if strength.score < 3}
        <p>Weak</p>
    {:else if strength.score < 4}
        <p>Moderate</p>
    {:else}
        <p>Strong</p>
    {/if}
{/if}
