import type { Prisma } from "$lib/generated/prisma/client";
import { hashToken } from "$lib/server/token";

/**
 * This authorizes a guest claim by its token and excludes registered-user claims.
 */
export const publicClaimByToken = (token: string) =>
    ({
        hashedToken: hashToken(token),
        claimedById: null,
        publicClaimedById: {
            not: null
        }
    }) satisfies Prisma.ItemClaimWhereInput;
