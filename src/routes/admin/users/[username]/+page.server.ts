import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import generateToken, { hashToken } from "$lib/server/token";
import { redirect, error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals, params }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        redirect(302, `/login?ref=/admin/users/${params.username}`);
    }
    if (locals.user.roleId != Role.ADMIN) {
        error(401, $t("errors.not-authorized"));
    }
    if (locals.user.username === params.username) {
        redirect(303, "/account");
    }

    const editingUser = await client.user.findUnique({
        where: {
            username: params.username
        },
        select: {
            username: true,
            name: true,
            id: true,
            role: {
                select: {
                    name: true
                }
            }
        }
    });

    if (!editingUser) error(404, $t("errors.user-not-found"));

    return { editingUser, user: locals.user };
};

export const actions: Actions = {
    "reset-password": async ({ params, url }) => {
        const $t = await getFormatter();
        const user = await client.user.findUnique({
            where: {
                username: params.username
            },
            select: {
                id: true
            }
        });

        if (user) {
            const token = await generateToken();
            await client.passwordReset.create({
                data: {
                    userId: user.id,
                    hashedToken: hashToken(token)
                }
            });

            const tokenUrl = new URL(`/reset-password?token=${token}`, url);
            return { success: true, url: tokenUrl.href };
        } else {
            error(422, $t("errors.user-not-found"));
        }
    },
    "make-admin": async ({ params }) => {
        await client.user.update({
            where: {
                username: params.username
            },
            data: {
                roleId: Role.ADMIN
            }
        });

        return { success: true, url: null };
    },
    "remove-admin": async ({ params }) => {
        await client.user.update({
            where: {
                username: params.username
            },
            data: {
                roleId: Role.USER
            }
        });

        return { success: true, url: null };
    }
};
