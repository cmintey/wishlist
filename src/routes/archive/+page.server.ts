import { requireLogin } from "$lib/server/auth";
import { getArchive } from "$lib/server/archive";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
    const user = requireLogin();
    return {
        items: await getArchive(user.id),
        initialViewPreference: (cookies.get("listViewPreference") === "tile" ? "tile" : "list") as "tile" | "list"
    };
};
