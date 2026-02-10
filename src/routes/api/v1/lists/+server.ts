import { authenticateApiRequest, isApiError } from "$lib/server/api-auth";
import { client } from "$lib/server/prisma";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * GET /api/v1/lists
 * Returns all lists for the authenticated user
 */
export const GET: RequestHandler = async (event) => {
    const authResult = await authenticateApiRequest(event);
    
    if (isApiError(authResult)) {
        return authResult;
    }

    const { user } = authResult;

    try {
        const lists = await client.list.findMany({
            where: {
                ownerId: user.id
            },
            select: {
                id: true,
                name: true,
                icon: true,
                iconColor: true,
                groupId: true,
                group: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        items: true
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        return json({
            lists: lists.map(list => ({
                id: list.id,
                name: list.name,
                icon: list.icon,
                iconColor: list.iconColor,
                groupId: list.groupId,
                groupName: list.group.name,
                itemCount: list._count.items
            }))
        });
    } catch (error) {
        console.error("Error fetching lists:", error);
        return json({ error: "Failed to fetch lists" }, { status: 500 });
    }
};
