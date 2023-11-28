<script lang="ts">
    import { page } from "$app/stores";
    import notFound from "$lib/assets/not_found.svg";
    import error from "$lib/assets/error.svg";

    type ErrorInfo = {
        image: string;
        message: string;
    };

    const errors: Record<number, ErrorInfo> = {
        404: {
            image: notFound,
            message: "The page you were looking for wasn't found"
        },
        500: {
            image: error,
            message: "Something went wrong"
        }
    };
</script>

<div class="flex flex-col items-center justify-center space-y-4 pt-4">
    <p class="text-4xl">{$page.status}</p>
    <img class="w-3/4 md:w-1/3" alt={errors[$page.status].message} src={errors[$page.status].image} />
    <p class="text-2xl">{errors[$page.status].message}</p>
</div>
