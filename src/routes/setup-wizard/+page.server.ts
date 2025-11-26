import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { userRepository } from "$lib/server/db/user.repository";

export const load: PageServerLoad = async ({ url }) => {
    const userCount = await userRepository.count();
    if (userCount > 0) {
        return redirect(302, url.searchParams.get("redirectTo") ?? "/");
    }
    return {};
};
