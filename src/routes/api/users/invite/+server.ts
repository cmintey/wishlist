import { getFormatter } from "$lib/i18n";
import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { sendSignupLink } from "$lib/server/email";
import { client } from "$lib/server/prisma";
import generateToken, { hashToken } from "$lib/server/token";
import { error, type RequestHandler } from "@sveltejs/kit";
import { z } from "zod";

export const POST: RequestHandler = async ({ locals, url, request }) => {
    const $t = await getFormatter();

    if (!locals.user) error(401, $t("errors.unauthenticated"));
    if (locals.user.roleId === Role.USER) error(401, $t("errors.not-authorized"));

    const config = await getConfig();
    let schema;

    if (config.smtp.enable) {
        schema = z.object({
            email: z.union([z.string().email().nullish(), z.literal("")]),
            group: z.string().optional(),
            method: z.enum(["link", "email"])
        });
    } else {
        schema = z.object({
            email: z.string().optional(),
            group: z.string().optional(),
            method: z.enum(["link"])
        });
    }

    const data = schema.safeParse(await request.json());

    if (!data.success) {
        error(400, data.error.format()._errors[0]);
    }

    if (data.data.group && locals.user.roleId !== Role.ADMIN) {
        const membership = await client.userGroupMembership.findFirst({
            select: {
                roleId: true
            },
            where: {
                userId: locals.user.id,
                groupId: data.data.group
            }
        });
        if (!membership || membership.roleId !== Role.GROUP_MANAGER) {
            error(401, $t("errors.not-authorized"));
        }
    }

    const token = await generateToken();
    const tokenUrl = new URL(`/signup?token=${token}`, url);

    if (data.data.method === "link" || !config.smtp.enable) {
        await client.signupToken.create({
            data: {
                hashedToken: hashToken(token),
                groupId: data.data.group
            }
        });

        return new Response(JSON.stringify({ url: tokenUrl.href }));
    }

    if (!data.data.email) {
        error(400, $t("errors.no-email-provided"));
    }

    await client.signupToken.create({
        data: {
            hashedToken: hashToken(token),
            groupId: data.data.group
        }
    });

    const msgInfo = await sendSignupLink(data.data.email, tokenUrl.href);
    if (msgInfo.success) {
        return new Response(JSON.stringify({}));
    }
    error(422, msgInfo.message);
};
