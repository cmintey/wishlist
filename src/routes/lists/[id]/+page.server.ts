import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getConfig } from "$lib/server/config";

export const load = (async ({ params }) => {
    const list = await client.publicList.findUnique({
        select: {
            user: true,
            groupId: true
        },
        where: {
            id: params.id
        }
    });
    if (!list) {
        error(404, "Public list not found");
    }

    const config = await getConfig(list.groupId);
    if (config.listMode !== "registry") {
        error(404, "Public list not found");
    }

    const items = await client.item.findMany({
        where: {
            userId: list.user.id,
            groupId: list.groupId
        },
        include: {
            addedBy: {
                select: {
                    username: true,
                    name: true
                }
            },
            pledgedBy: {
                select: {
                    username: true,
                    name: true
                }
            },
            publicPledgedBy: {
                select: {
                    username: true,
                    name: true
                }
            },
            user: {
                select: {
                    username: true,
                    name: true
                }
            },
            itemPrice: true
        }
    });

    return {
        user: {
            name: list.user.name
        },
        items
    };
}) satisfies PageServerLoad;
