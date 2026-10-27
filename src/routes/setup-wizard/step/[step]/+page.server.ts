import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resolve } from "$app/paths";

export const load: PageServerLoad = async ({ params }) => {
    const userCount = await client.user.count();
    const step = Number.parseInt(params.step);
    if (userCount === 0 && step > 1) {
        return redirect(302, resolve("/setup-wizard/step/1"));
    }

    const [config, groups] = await Promise.all([getConfig(), client.group.findMany()]);

    if (userCount === 0 && config.security.disablePasswordLogin) {
        return redirect(302, resolve("/login"));
    }

    if (userCount > 0 && step === 1) {
        return redirect(302, resolve("/setup-wizard/step/2"));
    }

    return { config, groups };
};
