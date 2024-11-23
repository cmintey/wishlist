import { getFormatter } from "$lib/i18n";
import { error, type RequestHandler } from "@sveltejs/kit";
import { readFileSync } from "fs";

export const GET: RequestHandler = async ({ params, locals }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        error(401, $t("errors.unauthenticated"));
    }

    if (!params.id) {
        error(400, $t("errors.must-specify-asset-id"));
    }

    try {
        const asset = readFileSync(`uploads/${params.id}`);
        return new Response(asset);
    } catch {
        error(404, $t("errors.asset-not-found"));
    }
};
