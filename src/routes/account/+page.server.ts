import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { resetPasswordSchema } from "$lib/validations";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createImage, tryDeleteImage } from "$lib/server/image-util";

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.validate();
    if (!session) {
        redirect(302, `/login?ref=/account`);
    }

    return {
        user: session.user
    };
};

export const actions: Actions = {
    profile: async ({ request, locals }) => {
        const session = await locals.validate();
        if (!session) redirect(302, "/login?ref=/account");

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
                    username: session.user.username
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
        const session = await locals.validate();
        if (!session) redirect(302, "/login?ref=/account");

        const form = await request.formData();
        const image = form.get("profilePic") as File;

        const filename = await createImage(session.user.username, image);

        if (filename) {
            const user = await client.user.findUniqueOrThrow({
                select: {
                    picture: true
                },
                where: {
                    id: session.user.userId
                }
            })
            await client.user.update({
                where: {
                    id: session.user.userId
                },
                data: {
                    picture: filename
                }
            });
            if (user.picture) {
                await tryDeleteImage(user.picture)
            }
        }
    },

    passwordchange: async ({ request, locals }) => {
        const session = await locals.validate();
        if (!session) redirect(302, "/login?ref=/account");

        const formData = Object.fromEntries(await request.formData());
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
            await auth.useKey("username", session.user.username, pwdData.data.oldPassword);
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "currentPassword", message: "Incorrect password" }]
            });
        }

        try {
            await auth.updateKeyPassword("username", session.user.username, pwdData.data.newPassword);
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "newPassword", message: "Unable to update password" }]
            });
        }
    }
};
