import { authenticateApiRequest, isApiError } from "$lib/server/api-auth";
import { client } from "$lib/server/prisma";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createImage, isValidImage } from "$lib/server/image-util";
import { getMinorUnits } from "$lib/price-formatter";
import { getLocale } from "$lib/server/i18n";
import { getNextDisplayOrderForLists } from "$lib/server/list";
import { itemEmitter } from "$lib/server/events/emitters";
import { ItemEvent } from "$lib/events";
import { getItemInclusions } from "$lib/server/items";
import { z } from "zod";

const createItemSchema = z.object({
    listId: z.string().min(1, "List ID is required"),
    name: z.string().min(1, "Item name is required"),
    url: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    price: z.number().positive().optional().nullable(),
    currency: z.string().min(1).max(3).optional().nullable(),
    note: z.string().optional().nullable(),
    quantity: z.number().int().positive().default(1),
    mostWanted: z.boolean().default(false)
});

/**
 * POST /api/v1/items
 * Create a new item in a list
 */
export const POST: RequestHandler = async (event) => {
    const authResult = await authenticateApiRequest(event);
    
    if (isApiError(authResult)) {
        return authResult;
    }

    const { user } = authResult;

    let body: unknown;
    try {
        body = await event.request.json();
    } catch {
        return json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = createItemSchema.safeParse(body);
    if (!parseResult.success) {
        return json({ 
            error: "Validation failed", 
            details: parseResult.error.flatten().fieldErrors 
        }, { status: 400 });
    }

    const { listId, name, url, imageUrl, price, currency, note, quantity, mostWanted } = parseResult.data;

    try {
        // Verify the list belongs to the user
        const list = await client.list.findUnique({
            where: { id: listId },
            include: {
                owner: true,
                managers: {
                    select: { userId: true }
                }
            }
        });

        if (!list) {
            return json({ error: "List not found" }, { status: 404 });
        }

        // Check if user owns the list or is a manager
        const isOwner = list.ownerId === user.id;
        const isManager = list.managers.some(m => m.userId === user.id);
        
        if (!isOwner && !isManager) {
            return json({ error: "You don't have permission to add items to this list" }, { status: 403 });
        }

        // Handle image
        let newImageFile: string | undefined | null;
        if (imageUrl) {
            try {
                console.log("Attempting to create image from URL:", imageUrl);
                newImageFile = await createImage(name, imageUrl);
                console.log("Image created:", newImageFile);
            } catch (e) {
                console.error("Failed to create image from URL:", e);
                // Continue without image
            }
        } else {
            console.log("No imageUrl provided");
        }

        // Handle price
        let itemPriceId: string | null = null;
        if (price && currency) {
            const itemPrice = await client.itemPrice.create({
                data: {
                    value: getMinorUnits(price, currency, getLocale()),
                    currency
                }
            });
            itemPriceId = itemPrice.id;
        }

        // Get next display order
        const nextDisplayOrder = await getNextDisplayOrderForLists([listId], mostWanted);

        // Create the item
        const item = await client.item.create({
            data: {
                userId: list.ownerId,
                name,
                url: url || null,
                note: note || null,
                imageUrl: newImageFile,
                createdById: user.id,
                itemPriceId,
                quantity,
                mostWanted,
                lists: {
                    create: {
                        listId,
                        addedById: user.id,
                        approved: true, // Always approved when created by owner/manager via API
                        displayOrder: nextDisplayOrder[listId] || 0
                    }
                }
            },
            include: getItemInclusions()
        });

        itemEmitter.emit(ItemEvent.ITEM_CREATE, item);

        return json({
            success: true,
            item: {
                id: item.id,
                name: item.name,
                url: item.url,
                imageUrl: item.imageUrl,
                note: item.note,
                quantity: item.quantity,
                mostWanted: item.mostWanted,
                price: item.itemPrice ? {
                    value: item.itemPrice.value,
                    currency: item.itemPrice.currency
                } : null,
                createdAt: item.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating item:", error);
        return json({ error: "Failed to create item" }, { status: 500 });
    }
};
