import { error, type RequestHandler } from "@sveltejs/kit";
import { readFileSync } from "fs";

export const GET: RequestHandler = async ({ params, locals }) => {
    const session = await locals.validate();

    if (!session) {
        throw error(401, "unauthorized");
    }

    if (!params.id) {
        throw error(400, "must specify asset id");
    }

    try {
        const asset = readFileSync(`uploads/${params.id}`);
        return new Response(asset);
    } catch {
        throw error(404, "item id not found");
    }
};
