<script lang="ts">
    import { page } from "$app/state";
    import notFoundAsset from "$lib/assets/not_found.svg";
    import errorAsset from "$lib/assets/error.svg";
    import unauthorizedAsset from "$lib/assets/unauthorized.svg";
    import { getFormatter } from "$lib/i18n";

    type ErrorInfo = {
        image: string;
        message: string;
    };

    const t = getFormatter();
    const errors: Record<number, ErrorInfo> = {
        401: {
            image: unauthorizedAsset,
            message: $t("errors.not-authorized")
        },
        404: {
            image: notFoundAsset,
            message: $t("errors.the-page-you-were-looking-for-wasnt-found")
        },
        500: {
            image: errorAsset,
            message: $t("errors.something-went-wrong")
        }
    };

    const error = $derived(errors[page.status] ? errors[page.status] : errors[500]);
    const errorMessage = $derived(page.error?.message || error.message);
</script>

<div class="flex flex-col items-center justify-center space-y-4 pt-4">
    <p class="text-4xl">{page.status}</p>
    <img class="w-3/4 md:w-1/3" alt={errorMessage} src={error.image} />
    <p class="text-2xl">{errorMessage}</p>
</div>
