import { getFormatter } from "$lib/server/i18n";
import { error, type RequestHandler } from "@sveltejs/kit";
import { readFileSync } from "fs";

export const GET: RequestHandler = async ({ params }) => {
    const $t = await getFormatter();

    if (!params.id) {
        error(400, $t("errors.must-specify-asset-id"));
    }

    try {
        const asset = readFileSync(`uploads/${params.id}`);
        return new Response(asset, {
            headers: {
                "Cache-Control": "public, max-age=31536000"
            }
        });
    } catch {
        error(404, $t("errors.asset-not-found"));
    }
};
