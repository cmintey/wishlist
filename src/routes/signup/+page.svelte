<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";

    import type { PageData } from "./$types";
    import CreateAccountForm from "$lib/components/CreateAccountForm.svelte";

    export let data: PageData;

    onMount(() => {
        if (data.valid) window.history.replaceState({}, "", "/signup");
    });
</script>

<div class="flex flex-col items-center space-y-4">
    <h1 class="h1">Create an account</h1>

    <form class="w-80 md:w-1/3" method="POST" use:enhance>
        <CreateAccountForm />
    </form>
</div>

<svelte:head>
    <title>Signup</title>
</svelte:head>
