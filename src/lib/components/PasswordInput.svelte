<script lang="ts">
    import { zxcvbn, zxcvbnOptions, type ZxcvbnResult } from "@zxcvbn-ts/core";
    import { loadOptions, meterLabel } from "$lib/zxcvbn";
    import { Progress } from "@skeletonlabs/skeleton-svelte";
    import { onMount } from "svelte";
    import { getFormatter } from "$lib/i18n";
    import type { HTMLInputAttributes } from "svelte/elements";
    import Popup from "./Popup.svelte";

    interface Props extends HTMLInputAttributes {
        id: string;
        name?: string | undefined;
        label: string;
        required?: boolean;
        autocomplete?: AutoFill | null | undefined;
        error?: boolean;
        value?: string | null | undefined;
        strengthMeter?: boolean;
    }

    let {
        id,
        name = undefined,
        label,
        required = false,
        autocomplete = undefined,
        error = false,
        value = $bindable(),
        strengthMeter = false,
        ...restProps
    }: Props = $props();
    const t = getFormatter();

    onMount(async () => {
        if (strengthMeter) {
            const options = await loadOptions();
            zxcvbnOptions.setOptions(options);
        }
    });

    let strength: ZxcvbnResult | undefined = $derived(value ? zxcvbn(value) : undefined);
    let visible = $state(false);

    const meterLookup = ["bg-error-500", "bg-error-500", "bg-warning-500", "bg-success-500", "bg-success-500"];

    const handleClick = (e: Event) => {
        e.preventDefault();
        visible = !visible;
    };
</script>

<label for={id}>
    <span>{label}</span>
    <div class="input-group grid-cols-[1fr_auto]">
        <input
            {id}
            {name}
            class="ig-input"
            class:input-error={error}
            {autocomplete}
            oninput={(e) => (value = e.currentTarget.value)}
            {required}
            type={visible ? "text" : "password"}
            {value}
            {...restProps}
        />
        <button
            id="showpassword"
            class="ig-cell border-l-0!"
            aria-label={$t("a11y.toggle-password-visibility")}
            onclick={handleClick}
            onkeypress={(e) => e.preventDefault()}
            tabindex="-1"
            type="button"
        >
            <iconify-icon class="-mb-0.5" icon="ion:{visible ? 'eye-off' : 'eye'}"></iconify-icon>
        </button>
    </div>
</label>

{#if strengthMeter && value !== "" && strength}
    <div class="flex flex-row items-center gap-x-1 pt-1">
        <Progress max={5} value={strength.score + 1}>
            <Progress.Label class="sr-only">{$t("a11y.password-strength")}</Progress.Label>
            <Progress.Track>
                <Progress.Range class={meterLookup[strength.score.valueOf()]} />
            </Progress.Track>
        </Progress>

        <Popup>
            {#snippet trigger(props)}
                <button
                    {...props}
                    class="flex items-center"
                    class:hidden={strength.feedback.suggestions.length === 0 && !strength.feedback.warning}
                >
                    <iconify-icon icon="ion:information-circle-outline"></iconify-icon>
                </button>
            {/snippet}
            {#snippet content(props)}
                <div {...props} class="card preset-filled p-4">
                    {#if strength.feedback.warning}
                        <div class="flex flex-row items-center gap-x-4 pb-1">
                            <iconify-icon icon="ion:alert-circle"></iconify-icon>
                            <p>{strength.feedback.warning}</p>
                        </div>
                    {/if}
                    <ul class="list">
                        {#each strength.feedback.suggestions as suggestion}
                            <li>
                                <iconify-icon icon="ion:arrow-forward"></iconify-icon>
                                <p>{suggestion}</p>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/snippet}
        </Popup>
    </div>

    <p>{$t(meterLabel[strength?.score])}</p>
{/if}
