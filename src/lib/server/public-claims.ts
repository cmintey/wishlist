import type { Prisma } from "$lib/generated/prisma/client";
import { hashToken } from "$lib/server/token";

// Public claimers have no account, so a claim's token is the only thing that
// authorizes managing it. Requiring publicClaimedById keeps a registered user's
// claim out of reach even if it somehow carried a token.
export const publicClaimByToken = (token: string) =>
    ({
        hashedToken: hashToken(token),
        publicClaimedById: {
            not: null
        }
    }) satisfies Prisma.ItemClaimWhereInput;
