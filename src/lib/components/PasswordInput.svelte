<script lang="ts">
	import { zxcvbn, zxcvbnOptions, type ZxcvbnResult } from "@zxcvbn-ts/core";
	import { loadOptions } from "$lib/validations/zxcvbn";
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

	const meterLookup = [
		"bg-error-500",
		"bg-error-500",
		"bg-error-500",
		"bg-warning-500",
		"bg-success-500"
	];

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
			class="input"
			type={visible ? "text" : "password"}
			{id}
			{name}
			{required}
			class:input-error={error}
			{value}
			{autocomplete}
			on:input={(e) => (value = e.currentTarget.value)}
			{...$$props}
		/>
		<button
			type="button"
			id="showpassword"
			on:click|preventDefault={handleClick}
			on:keypress|preventDefault
			tabindex="-1"
		>
			<iconify-icon icon="ion:{visible ? 'eye-off' : 'eye'}" class="-mb-0.5" />
		</button>
	</div>
</label>

{#if strengthMeter}
	{#if value !== "" && strength}
		<div class="flex flex-row space-x-1 items-center">
			<ProgressBar
				label="Password Strength"
				value={strength.score + 1}
				max={5}
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
			{#each strength.feedback.suggestions as suggestion}
				<p>{suggestion}</p>
			{/each}
			<p>{strength.feedback.warning}</p>
		</div>

		{#if strength.score < 3}
			<p>Weak</p>
		{:else if strength.score < 4}
			<p>Moderate</p>
		{:else}
			<p>Strong</p>
		{/if}
	{/if}
{/if}
