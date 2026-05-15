import type { Prisma } from "$lib/generated/prisma/client";
import { fail } from "@sveltejs/kit";
import z from "zod";
import { client } from "./prisma";
import { getFormatter } from "./i18n";
import { logger } from "./logger";
import { createImage, tryDeleteImage } from "./image-util";
import { getResetPasswordSchema } from "./validations";
import { hashPassword, verifyPasswordHash } from "./password";
import {
    createSession,
    generateSessionToken,
    invalidateSession,
    invalidateUserSessions,
    setSessionTokenCookie
} from "./auth";

export const updateProfile = async (userId: string, formData: FormData) => {
    const $t = await getFormatter();

    const schema = z.object({
        name: z.string().trim().min(1, $t("errors.name-must-not-be-blank")),
        username: z.string().trim().min(1, $t("errors.username-must-not-be-blank")),
        email: z.email()
    });
    const nameData = schema.safeParse(Object.fromEntries(formData));
    if (!nameData.success) {
        return fail(400, { error: true, errors: z.flattenError(nameData.error).fieldErrors });
    }

    try {
        await client.user.update({
            data: {
                name: nameData.data.name,
                username: nameData.data.username,
                email: nameData.data.email
            },
            where: {
                id: userId
            }
        });
    } catch (e) {
        const err = e as Prisma.PrismaClientKnownRequestError;
        logger.error({ err: e });
        const targets = err.meta?.target as string[];
        const errors = targets.reduce(
            (prev, target) => ({
                ...prev,
                [target]: [$t("errors.username-already-in-use", { values: { username: target } })]
            }),
            {}
        );
        return fail(400, {
            error: true,
            errors
        });
    }
};

export const updatePicture = async (userId: string, username: string, formData: FormData) => {
    const image = formData.get("profilePic") as File;

    const filename = await createImage(username, image);

    if (filename) {
        const user = await client.user.findUniqueOrThrow({
            select: {
                picture: true
            },
            where: {
                id: userId
            }
        });
        await client.user.update({
            where: {
                id: userId
            },
            data: {
                picture: filename
            }
        });
        if (user.picture) {
            await tryDeleteImage(user.picture);
        }
    }
    return filename;
};
