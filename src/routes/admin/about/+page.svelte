<script lang="ts">
    const version: string = __VERSION__;
    const sha: string = __COMMIT_SHA__;
    const builtAt: string = new Date(__LASTMOD__).toLocaleString();
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">Wishlist</h2>
    <span>
        Version: <a href="https://github.com/cmintey/wishlist/releases/tag/{version}">{version ? version : "dev"}</a>
    </span>
    <span>
        Build: <a href="https://github.com/cmintey/wishlist/commit/{sha}">{sha ? sha : "dev"}</a>
    </span>
    <span>Build Date: {builtAt ? builtAt : "unknown"}</span>
</div>
