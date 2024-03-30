import { error, type RequestHandler } from "@sveltejs/kit";
import { readFileSync } from "fs";

export const GET: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        error(401, "unauthorized");
    }

    if (!params.id) {
        error(400, "must specify asset id");
    }

    try {
        const asset = readFileSync(`uploads/${params.id}`);
        return new Response(asset);
    } catch {
        error(404, "item id not found");
    }
};
