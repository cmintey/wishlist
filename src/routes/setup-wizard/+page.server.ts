import { client } from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    const userCount = await client.user.count();
    if (userCount > 0) {
        return redirect(302, url.searchParams.get("redirectTo") ?? "/");
    }
    return {};
};
