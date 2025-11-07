import { Role } from "$lib/schema";
import { requireLoginOrError, requireRole } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { createUser } from "$lib/server/user";
import { getSignupSchema } from "$lib/server/validations";
import type { User } from "@prisma/client";
import { error, type RequestHandler } from "@sveltejs/kit";
import { treeifyError } from "zod";

export const GET: RequestHandler = async ({ url }) => {
    await requireLoginOrError();

    let users: Pick<User, "id" | "name" | "email">[] = [];

    users = await client.user.findMany({
        select: {
            id: true,
            name: true,
            username: true,
            email: true
        },
        where: {
            id: {
                notIn: url.searchParams.get("excludedUserIds")?.split(",") || undefined
            },
            OR: [
                { name: { contains: url.searchParams.get("name") || undefined } },
                { username: { contains: url.searchParams.get("name") || undefined } }
            ],
            UserGroupMembership: url.searchParams.has("groupId")
                ? {
                      some: {
                          groupId: url.searchParams.get("groupId") || undefined
                      }
                  }
                : {}
        }
    });

    return new Response(JSON.stringify(users));
};

export const PUT: RequestHandler = async ({ request }) => {
    await requireRole(Role.ADMIN);

    const result = await getSignupSchema().then(async (schema) => {
        const data = await request.json();
        return schema.safeParseAsync(data);
    });
    if (result.error) {
        return error(422, JSON.stringify(treeifyError(result.error)));
    }

    const data = await createUser(result.data, Role.USER, result.data.password);
    return new Response(JSON.stringify(data), { status: 201 });
};
