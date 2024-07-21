import { client } from "$lib/server/prisma";
import { publicListCreateSchema } from "$lib/validations";
import { error, type RequestHandler } from "@sveltejs/kit";
import { init } from "@paralleldrive/cuid2";

export const GET: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        error(401, "User is not authenticated");
    }

    const url = new URL(request.url);

    const groupId = url.searchParams.get("groupId");
    if (!groupId) {
        error(422, "Missing groupId from request parameters");
    }

    const existingList = await client.publicList.findFirst({
        select: {
            id: true
        },
        where: {
            userId: locals.user.id,
            groupId
        }
    });
    if (!existingList) {
        return new Response(JSON.stringify({}), { status: 404 });
    }

    return new Response(JSON.stringify({ id: existingList.id }), { status: 200 });
};

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        error(401, "User is not authenticated");
    }

    const data = await request.json().then(publicListCreateSchema.safeParse);

    if (!data.success) {
        error(422, data.error.message);
    }
    const groupId = data.data.groupId;

    const existingList = await client.publicList.findFirst({
        select: {
            id: true
        },
        where: {
            userId: locals.user.id,
            groupId
        }
    });
    if (existingList) {
        error(409, "Public list already exists for the user and group");
    }

    const createId = init({
        length: 10
    });

    const list = await client.publicList.create({
        select: {
            id: true
        },
        data: {
            id: createId(),
            userId: locals.user.id,
            groupId
        }
    });

    return new Response(JSON.stringify({ id: list.id }), { status: 201 });
};
