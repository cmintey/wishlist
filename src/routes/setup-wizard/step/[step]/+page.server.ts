import { getConfig } from "$lib/server/config";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { userRepository } from "$lib/server/db/user.repository";
import { groupRepository } from "$lib/server/db/group.repository";

export const load: PageServerLoad = async ({ params }) => {
    const userCount = await userRepository.count();
    const step = Number.parseInt(params.step);
    if (userCount === 0 && step > 1) {
        return redirect(302, "/setup-wizard/step/1");
    }

    if (userCount > 0 && step === 1) {
        return redirect(302, "/setup-wizard/step/2");
    }

    const [config, groups] = await Promise.all([getConfig(), groupRepository.findAll()]);

    return { config, groups };
};
