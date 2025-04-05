import { getFormatter } from "$lib/i18n";
import { requireLoginOrError } from "$lib/server/auth";
import { error, type RequestHandler } from "@sveltejs/kit";
import { readFileSync } from "fs";

export const GET: RequestHandler = async ({ params }) => {
    await requireLoginOrError();
    const $t = await getFormatter();

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
