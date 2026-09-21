import { Role } from "$lib/schema";
import { requireLoginOrError, requireRole } from "$lib/server/auth";
import { getActiveMembership } from "$lib/server/group-membership";
import { getFormatter } from "$lib/server/i18n";
import { logger } from "$lib/server/logger";
import { client } from "$lib/server/prisma";
import { createUser } from "$lib/server/user";
import { getSignupSchema } from "$lib/server/validations";
import { error, type RequestHandler } from "@sveltejs/kit";
import { treeifyError } from "zod";

export const GET: RequestHandler = async ({ url }) => {
    const loggedInUser = await requireLoginOrError();
    const activeGroup = await getActiveMembership(loggedInUser);

    const $t = await getFormatter();

    if (
        !url.searchParams.has("groupId") &&
        !(loggedInUser.roleId === Role.ADMIN || activeGroup.roleId === Role.GROUP_MANAGER)
    ) {
        logger.error(
            { userId: loggedInUser.id, role: loggedInUser.roleId },
            "User tried to list all users but is not an admin or group manager"
        );
        error(403, $t("errors.not-authorized"));
    }

    if (url.searchParams.has("groupId") && loggedInUser.roleId === Role.USER) {
        if (activeGroup.groupId !== url.searchParams.get("groupId")) {
            logger.error({ userId: loggedInUser.id }, "User tried to list users in a group they are not part of");
            error(403, $t("errors.not-authorized"));
        }
    }

    const users = await client.user.findMany({
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
