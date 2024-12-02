import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { getResetPasswordSchema } from "$lib/validations";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createImage, tryDeleteImage } from "$lib/server/image-util";
import { LegacyScrypt } from "lucia";

export const load: PageServerLoad = async ({ locals, request }) => {
    const user = locals.user;
    if (!user) {
        redirect(302, `/login?ref=/account`);
    }

    const isProxyUser =
        (env.HEADER_AUTH_ENABLED ?? "false") == "true" &&
        !!env.HEADER_USERNAME &&
        !!request.headers.get(env.HEADER_USERNAME);

    return {
        user,
        isProxyUser
    };
};

export const actions: Actions = {
    profile: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) redirect(302, "/login?ref=/account");

        const formData = Object.fromEntries(await request.formData());
        const schema = z.object({
            name: z.string().trim().min(1, "Name must not be blank"),
            username: z.string().trim().min(1, "Username must not be blank"),
            email: z.string().email()
        });
        const nameData = schema.safeParse(formData);
        // check for empty values
        if (!nameData.success) {
            const errors = nameData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
        }

        try {
            await client.user.update({
                data: {
                    name: nameData.data.name,
                    username: nameData.data.username,
                    email: nameData.data.email
                },
                where: {
                    username: user.username
                }
            });
        } catch (e) {
            const err = e as PrismaClientKnownRequestError;
            console.log(e);
            const targets = err.meta?.target as string[];
            return fail(400, {
                error: true,
                errors: [{ field: targets[0], message: `${targets[0]} already in use` }]
            });
        }
    },

    profilePicture: async ({ request, locals }) => {
        if (!locals.user) redirect(302, "/login?ref=/account");

        const form = await request.formData();
        const image = form.get("profilePic") as File;

        const filename = await createImage(locals.user.username, image);

        if (filename) {
            const user = await client.user.findUniqueOrThrow({
                select: {
                    picture: true
                },
                where: {
                    id: locals.user.id
                }
            });
            await client.user.update({
                where: {
                    id: locals.user.id
                },
                data: {
                    picture: filename
                }
            });
            if (user.picture) {
                await tryDeleteImage(user.picture);
            }
        }
    },

    passwordchange: async ({ request, locals, cookies }) => {
        if (!(locals.user && locals.session)) redirect(302, "/login?ref=/account");

        const formData = Object.fromEntries(await request.formData());
        const resetPasswordSchema = await getResetPasswordSchema();
        const pwdData = resetPasswordSchema.safeParse(formData);

        if (!pwdData.success) {
            const errors = pwdData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
        }

        try {
            const user = await client.user.findUniqueOrThrow({
                select: {
                    hashedPassword: true
                },
                where: {
                    id: locals.user.id
                }
            });

            const validPassword = await new LegacyScrypt().verify(user.hashedPassword, pwdData.data.oldPassword);
            if (!validPassword) {
                return fail(400, {
                    error: true,
                    errors: [{ field: "currentPassword", message: "Incorrect password" }]
                });
            }
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "currentPassword", message: "Incorrect password" }]
            });
        }

        try {
            const newHashedPassword = await new LegacyScrypt().hash(pwdData.data.newPassword);
            await client.user.update({
                data: {
                    hashedPassword: newHashedPassword
                },
                where: {
                    id: locals.user.id
                }
            });
            const session = await auth.createSession(locals.user.id, {});
            const sessionCookie = auth.createSessionCookie(session.id);
            if (pwdData.data.invalidateSessions) {
                console.log("invalidating all sessions");
                await auth.invalidateUserSessions(locals.user.id);
            } else {
                await auth.invalidateSession(locals.session.id);
                cookies.set(sessionCookie.name, sessionCookie.value, {
                    path: "/",
                    ...sessionCookie.attributes
                });
            }
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "newPassword", message: "Unable to update password" }]
            });
        }
    }
};
