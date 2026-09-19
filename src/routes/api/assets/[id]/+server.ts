import { getFormatter } from "$lib/server/i18n";
import { error, type RequestHandler } from "@sveltejs/kit";
import { readFileSync } from "fs";
import path from "path";

export const GET: RequestHandler = async ({ params }) => {
    const $t = await getFormatter();

    if (!params.id) {
        error(400, $t("errors.must-specify-asset-id"));
    }

    const normalizedPath = path.normalize(params.id);
    if (path.isAbsolute(normalizedPath)) {
        error(400, $t("error.invalid-asset-path"));
    }

    const baseUploadsPath = path.resolve("uploads/");
    const resolvedPath = path.resolve("uploads/" + normalizedPath);

    if (!resolvedPath?.startsWith(baseUploadsPath)) {
        error(400, $t("error.invalid-asset-path"));
    }

    try {
        const asset = readFileSync(resolvedPath);
        return new Response(asset, {
            headers: {
                "Cache-Control": "public, max-age=31536000"
            }
        });
    } catch {
        error(404, $t("errors.asset-not-found"));
    }
};
