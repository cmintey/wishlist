<script lang="ts">
    import { enhance } from "$app/forms";
    import CreateAccountForm from "$lib/components/CreateAccountForm.svelte";
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";

    let button: HTMLButtonElement;
    const submit: Writable<() => void> = getContext("submit");
    $submit = () => {
        button?.click();
    };
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">Create your account</h1>
    <span>Your first account will be the administrator. You can always add more admins later.</span>
    <form class="w-80 md:w-1/3" action="/signup" method="POST" use:enhance>
        <CreateAccountForm hideActions />
        <button bind:this={button} hidden type="submit" />
    </form>
</div>
