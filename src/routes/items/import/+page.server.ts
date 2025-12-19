import { requireLogin, requireLoginOrError } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import z from "zod";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { setActiveMembership } from "$lib/server/group-membership";
import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";

export const load: PageServerLoad = async ({ url }) => {
    const user = requireLogin();

    const productUrl = url.searchParams.get("url");
    const productText = url.searchParams.get("text");
    const productTitle = url.searchParams.get("title");

    const groups = await client.userGroupMembership.findMany({
        include: {
            group: {
                select: {
                    name: true
                }
            }
        },
        where: {
            userId: user.id
        }
    });

    const lists = await client.list.findMany({
        select: {
            id: true,
            name: true,
            icon: true,
            groupId: true,
            owner: {
                select: {
                    name: true
                }
            }
        },
        where: {
            ownerId: user.id
        }
    });

    return {
        groups: groups.map(({ group, ...membership }) => ({
            ...group,
            id: membership.groupId,
            active: membership.active
        })),
        lists,
        url: productUrl || extractUrl(productText) || extractUrl(productTitle)
    };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const user = await requireLoginOrError();

        const schema = z.object({
            group: z.string(),
            list: z.string(),
            url: z.string()
        });

        const result = await request.formData().then(Object.fromEntries).then(schema.safeParseAsync);

        if (result.error) {
            return fail(422, z.flattenError(result.error).fieldErrors);
        }

        await setActiveMembership(user.id, result.data.group);

        const createItemRoute = resolve("/lists/[id]/create-item", { id: result.data.list });
        return redirect(
            303,
            createItemRoute + "?" + new URLSearchParams({ productUrl: result.data.url, redirectTo: "/lists" })
        );
    }
};

function extractUrl(url: string | undefined | null) {
    if (!url) {
        return null;
    }
    const urlRegex = /(https?):\/\/[^\s/$.?#].[^\s]*/;
    const matches = url.match(urlRegex);
    if (matches) {
        return matches[0];
    }
    return null;
}
