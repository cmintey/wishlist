<script lang="ts">
	export let id: string;
	export let name: string | undefined = undefined;
	export let label: string;
	export let required = false;
	export let autocomplete: string | null | undefined = undefined;
	export let error = false;
	export let value: string | null | undefined = "";

	let visible = false;

	const handleClick = () => {
		visible = !visible;
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
		>
			<iconify-icon icon="ion:{visible ? 'eye-off' : 'eye'}" class="-mb-0.5" />
		</button>
	</div>
</label>
