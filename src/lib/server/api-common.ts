import { getLocale } from "#lib/server/i18n.js";
import { getMinorUnits } from "#lib/price-formatter.js";
import type { Prisma } from "#lib/generated/prisma/client.js";

export const patchItem = (body: Record<string, unknown>) => {
    const data: Prisma.ItemUpdateInput & { id?: number } = {
        id: body.id as number
    };
    let deleteOldImage = false;

    if (body.name && typeof body.name === "string") data.name = body.name;
    if (body.url && typeof body.url === "string") data.url = body.url;
    if (body.note && typeof body.note === "string") data.note = body.note;
    if (body.image_url && typeof body.image_url === "string") {
        data.imageUrl = body.image_url;
        deleteOldImage = true;
    }
    if (body.price && typeof body.price === "number" && body.currency && typeof body.currency === "string") {
        data.itemPrice = {
            create: {
                value: getMinorUnits(body.price, body.currency, getLocale()),
                currency: body.currency
            },
            delete: true
        };
    }

    return {
        data,
        deleteOldImage
    };
};
