import { fail, type RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import { getConfig } from "./config";
import { sendSignupLink } from "./email";
import { client } from "./prisma";
import generateToken, { hashToken } from "./token";

export const inviteUser = async ({ url, request }: RequestEvent) => {
    const token = await generateToken();
    const tokenUrl = new URL(`/signup?token=${token}`, url);
    const formData = Object.fromEntries(await request.formData());
    let schema;

    const config = await getConfig();
    if (config.smtp.enable) {
        schema = z.object({
            "invite-email": z.string().email(),
            "invite-group": z.string().optional()
        });
    } else {
        schema = z.object({
            "invite-email": z.string().optional(),
            "invite-group": z.string().optional()
        });
    }

    const data = schema.safeParse(formData);

    if (!data.success) {
        const errors = data.error.errors.map((error) => {
            return {
                field: error.path[0],
                message: error.message
            };
        });
        return fail(400, { action: "invite-email", error: true, errors });
    }

    if (!config.smtp.enable) {
        await client.signupToken.create({
            data: {
                hashedToken: hashToken(token),
                groupId: data.data["invite-group"]
            }
        });

        return { action: "invite-email", success: true, url: tokenUrl.href };
    }

    await client.signupToken.create({
        data: {
            hashedToken: hashToken(token),
            groupId: data.data["invite-group"]
        }
    });

    await sendSignupLink(data.data["invite-email"]!, tokenUrl.href);
    return { action: "invite-email", success: true, url: null };
};
