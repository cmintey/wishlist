<script lang="ts">
    import Avatar from "./Avatar.svelte";

    export let hideCount = false;
    export let user: {
        name: string;
        username: string;
        items: { id: number }[];
        _count?: {
            items: number;
        };
    };
    export let newItems = false;
</script>

<a class="card" data-sveltekit-preload-data href="/wishlists/{user.username}">
    <div class="card-header">
        <div class="flex flex-row items-center space-x-4 pb-4">
            <Avatar {user} width="w-14" />
            <div class="flex flex-col">
                <span class="text-3xl font-bold">
                    <span class="unstyled text-primary-700-200-token no-underline">{user.name}</span>
                </span>
                <div class="flex flex-row items-center space-x-2">
                    <iconify-icon icon="ion:gift" />
                    <span>
                        {!hideCount && user._count ? `${user._count.items}/` : ""}{user.items.length}
                    </span>
                    {#if newItems}
                        <iconify-icon
                            class="text-primary-700-200-token opacity-40"
                            icon="ion:ellipse-sharp"
                            width="10px"
                        />
                    {/if}
                </div>
            </div>
        </div>
    </div>
</a>
