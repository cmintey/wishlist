import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { getSignupSchema } from "$lib/validations";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { hashToken } from "$lib/server/token";
import { getConfig } from "$lib/server/config";
import { Role } from "$lib/schema";
import { env } from "$env/dynamic/private";
import { LegacyScrypt } from "lucia";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals, request }) => {
    if (locals.user) redirect(302, "/");

    const $t = await getFormatter();
    const config = await getConfig();

    const token = new URL(request.url).searchParams.get("token");
    if (token) {
        const signup = await client.signupToken.findFirst({
            where: {
                hashedToken: hashToken(token),
                redeemed: false
            },
            select: {
                id: true,
                createdAt: true
            }
        });

        if (!signup) error(400, $t("errors.reset-token-not-found"));

        const expiresIn = (env.TOKEN_TIME ? Number.parseInt(env.TOKEN_TIME) : 72) * 3600000;
        const expiry = signup.createdAt.getTime() + expiresIn;
        if (Date.now() < expiry) {
            return { valid: true, id: signup.id };
        }
        error(400, $t("errors.invite-code-invalid"));
    }
    if (!config.enableSignup) {
        error(404, $t("errors.this-instance-is-invite-only"));
    }
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());
        const signupSchema = await getSignupSchema();
        const signupData = signupSchema.safeParse(formData);
        const $t = await getFormatter();

        // check for empty values
        if (!signupData.success) {
            const errors = signupData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
        }

        const userCount = await client.user.count();
        let groupId: string | undefined;
        if (signupData.data.tokenId) {
            groupId = await client.signupToken
                .findUnique({
                    where: {
                        id: signupData.data.tokenId
                    },
                    select: {
                        groupId: true
                    }
                })
                .then((data) => data?.groupId);
        } else if (userCount === 0) {
            groupId = (
                await client.group.findFirst({
                    select: {
                        id: true
                    }
                })
            )?.id;
        }

        try {
            const hashedPassword = await new LegacyScrypt().hash(signupData.data.password);
            const user = await client.user.create({
                select: {
                    id: true
                },
                data: {
                    username: signupData.data.username,
                    email: signupData.data.email,
                    hashedPassword,
                    name: signupData.data.name,
                    roleId: userCount > 0 ? Role.USER : Role.ADMIN
                }
            });

            const session = await auth.createSession(user.id, {});
            const sessionCookie = auth.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: "/",
                ...sessionCookie.attributes
            });

            if (groupId) {
                await client.userGroupMembership.create({
                    data: {
                        groupId: groupId,
                        userId: user.id,
                        active: true
                    }
                });
            }

            if (signupData.data.tokenId) {
                await client.signupToken.update({
                    where: {
                        id: signupData.data.tokenId
                    },
                    data: {
                        redeemed: true
                    }
                });
            }
            return { success: true };
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "username", message: $t("errors.user-already-exists") }]
            });
        }
    }
};
