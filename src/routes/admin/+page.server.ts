import { Role } from "$lib/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        redirect(302, `/login?ref=/admin`);
    }
    if (locals.user.roleId !== Role.ADMIN) {
        error(401, $t("errors.not-authorized"));
    }

    redirect(302, "/admin/users");
};
