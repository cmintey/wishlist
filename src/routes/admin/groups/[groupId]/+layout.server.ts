import { client } from "$lib/server/prisma";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
    const group = await client.group.findUniqueOrThrow({
        where: {
            id: params.groupId
        },
        select: {
            id: true,
            name: true
        }
    });

    return {
        group
    };
};
