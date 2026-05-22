import { fail } from "@sveltejs/kit";
import z from "zod";
import { client } from "./prisma";
import { getFormatter } from "./i18n";
import { logger } from "./logger";
import { createImage, tryDeleteImage } from "./image-util";

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
    } catch (err) {
        logger.error({ err });
        return fail(400, {
            message: "Unable to update profile information. Check logs for details."
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

export const unlinkOauth = async (userId: string) => {
    await client.user.update({
        data: {
            oauthId: null
        },
        where: {
            id: userId
        }
    });
};
