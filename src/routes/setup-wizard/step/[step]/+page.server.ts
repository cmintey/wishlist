import { getConfig } from "$lib/server/config";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const config = await getConfig();

    return { config };
};
