import { client } from "$lib/server/prisma";

// Kept separate from the membership query so claim disclosure can be changed independently.
function archiveClaims(
    claims: {
        quantity: number;
        claimedBy: { name: string } | null;
        publicClaimedBy: { name: string | null } | null;
    }[]
) {
    return claims.map((claim) => ({
        quantity: claim.quantity,
        name: claim.claimedBy?.name ?? claim.publicClaimedBy?.name ?? null
    }));
}

export async function getArchive(userId: string) {
    const items = await client.item.findMany({
        where: {
            archived: true,
            OR: [{ createdById: userId }, { userId }, { claims: { some: { claimedById: userId } } }]
        },
        select: {
            id: true,
            name: true,
            price: true,
            url: true,
            note: true,
            imageUrl: true,
            quantity: true,
            mostWanted: true,
            createdById: true,
            user: { select: { name: true } },
            itemPrice: { select: { value: true, currency: true } },
            claims: {
                select: {
                    quantity: true,
                    claimedBy: { select: { name: true } },
                    publicClaimedBy: { select: { name: true } }
                }
            }
        },
        orderBy: { id: "desc" }
    });
    return items.map(({ createdById, claims, ...item }) => ({
        ...item,
        canRestore: createdById === userId,
        claims: archiveClaims(claims)
    }));
}
