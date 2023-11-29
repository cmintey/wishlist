<script lang="ts">
    import noGroup from "$lib/assets/no_group.svg";
</script>

<div class="flex flex-col items-center justify-center space-y-4 pt-4">
    <h1 class="h1">Can't find your group!</h1>
    <img class="w-3/4 pt-4 md:w-1/3" alt="A person looking at an empty board" src={noGroup} />
    <p class="text-center">
        If you're seeing this page, it's because you aren't in a group yet! Either request a group to join, or create
        your own.
    </p>
</div>
