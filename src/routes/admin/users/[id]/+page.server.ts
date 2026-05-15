import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import generateToken, { hashToken } from "$lib/server/token";
import { redirect, error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getFormatter } from "$lib/server/i18n";
import { requireRole } from "$lib/server/auth";
import { updatePicture, updateProfile } from "$lib/server/profile";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
    const user = await requireRole(Role.ADMIN);
    const $t = await getFormatter();

    if (user.username === params.id) {
        redirect(303, "/account");
    }

    const editingUser = await client.user.findUnique({
        where: {
            id: params.id
        },
        select: {
            username: true,
            email: true,
            name: true,
            id: true,
            picture: true,
            oauthId: true,
            role: {
                select: {
                    name: true
                }
            }
        }
    });

    if (!editingUser) error(404, $t("errors.user-not-found"));

    return {
        editingUser: {
            ...editingUser,
            isOauthManaged: editingUser.oauthId !== null
        },
        user
    };
};

export const actions: Actions = {
    profile: async ({ params, request }) => {
        await requireRole(Role.ADMIN);
        const user = await client.user.findUnique({
            where: {
                id: params.id
            },
            select: {
                id: true
            }
        });

        if (!user) {
            return fail(404, "User not found");
        }

        return request.formData().then((fd) => updateProfile(user.id, fd));
    },

    profilePicture: async ({ params, request }) => {
        await requireRole(Role.ADMIN);
        const user = await client.user.findUnique({
            where: {
                id: params.id
            },
            select: {
                id: true,
                username: true
            }
        });

        if (!user) {
            return fail(404, "User not found");
        }
        return request.formData().then((fd) => updatePicture(user.id, user.username, fd));
    },
    "reset-password": async ({ params, url }) => {
        await requireRole(Role.ADMIN);
        const $t = await getFormatter();

        const user = await client.user.findUnique({
            where: {
                id: params.id
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
        await requireRole(Role.ADMIN);

        await client.user.update({
            where: {
                id: params.id
            },
            data: {
                roleId: Role.ADMIN
            }
        });

        return { success: true, url: null };
    },
    "remove-admin": async ({ params }) => {
        await requireRole(Role.ADMIN);

        await client.user.update({
            where: {
                id: params.id
            },
            data: {
                roleId: Role.USER
            }
        });

        return { success: true, url: null };
    }
};
