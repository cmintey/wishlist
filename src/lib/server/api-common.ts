import type { Prisma } from "@prisma/client";

export const patchItem = (body: Record<string, unknown>) => {
    const data: Prisma.ItemUpdateInput & { id?: number } = {
        id: body.id as number
    };
    let deleteOldImage = false;

    if (body.name && typeof body.name === "string") data.name = body.name;
    if (body.price && typeof body.price === "string") data.price = body.price;
    if (body.url && typeof body.url === "string") data.url = body.url;
    if (body.note && typeof body.note === "string") data.note = body.note;
    if (body.displayOrder !== null && typeof body.displayOrder === "number")
        data.displayOrder = body.displayOrder as number;
    if (body.image_url && typeof body.image_url === "string") {
        data.imageUrl = body.image_url;
        deleteOldImage = true;
    }
    if (body.pledgedById && typeof body.pledgedById === "string") {
        if (body.pledgedById === "0") {
            data.pledgedBy = {
                disconnect: true
            };
        } else {
            data.pledgedBy = {
                connect: {
                    id: body.pledgedById
                }
            };
        }
    }
    if (body.publicPledgedById && typeof body.publicPledgedById === "string") {
        if (body.publicPledgedById === "0") {
            data.publicPledgedBy = {
                disconnect: true
            };
        } else {
            data.publicPledgedBy = {
                connect: {
                    id: body.publicPledgedById
                }
            };
        }
    }
    if (Object.keys(body).includes("approved") && typeof body.approved === "boolean") data.approved = body.approved;
    if (Object.keys(body).includes("purchased") && typeof body.purchased === "boolean") data.purchased = body.purchased;

    return {
        data,
        deleteOldImage
    };
};
