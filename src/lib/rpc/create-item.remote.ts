import { form, getRequestEvent } from "$app/server";
import { ItemEvent } from "$lib/events";
import type { List, Prisma } from "$lib/generated/prisma/client";
import { getMinorUnits } from "$lib/price-formatter";
import { requireLogin } from "$lib/server/auth";
import { getConfig } from "$lib/server/config";
import { itemEmitter } from "$lib/server/events/emitters";
import { getActiveMembership } from "$lib/server/group-membership";
import { getFormatter, getLocale } from "$lib/server/i18n";
import { createImage, isValidImage } from "$lib/server/image-util";
import { getItemInclusions } from "$lib/server/items";
import { getById, getNextDisplayOrderForLists } from "$lib/server/list";
import { client } from "$lib/server/prisma";
import { getItemCreateSchema } from "$lib/server/validations";
import { fail, redirect } from "@sveltejs/kit";
import z from "zod";

const trimToUndefined = <T>() => z.transform((v: T) => (v === "" ? undefined : v));

const schema = z.object({
    url: z.string().pipe(trimToUndefined()).pipe(z.httpUrl().optional()).optional(),
    name: z.string().nonempty(),
    price: z.float64().optional(),
    currency: z.string().pipe(trimToUndefined()).optional(),
    quantity: z
        .number()
        .max(999)
        .optional()
        .transform((v) => (v === undefined ? null : v)),
    imageUrl: z.string().pipe(trimToUndefined()).optional(),
    image: z.file().optional(),
    mostWanted: z.boolean().default(false),
    note: z.string().pipe(trimToUndefined()).optional(),
    lists: z
        .discriminatedUnion("addTo", [
            z.object({
                id: z.string().nonempty(),
                addTo: z.enum(["none", "top", "bottom"])
            }),
            z.object({
                id: z.string().nonempty(),
                addTo: z.literal("before"),
                item: z.number()
            })
        ])
        .array()
        .min(1, "errors.an-item-must-be-added-to-at-least-one-list")
    // lists: z
    //     .union([z.string(), z.tuple([z.string()], z.string())], {
    //         error: $t("errors.an-item-must-be-added-to-at-least-one-list")
    //     })
    //     .transform((v) => (typeof v === "string" ? [v] : v))
});

export const createItem = form(schema, async (data, issue) => {
    const { params, url: requestUrl } = getRequestEvent();
    const user = requireLogin();
    const $t = await getFormatter();

    console.log("formdata", data);
    const activeMembership = await getActiveMembership(user);

    const list = params.id ? await getById(params.id) : null;
    if (!list) {
        return fail(404, { success: false, message: $t("errors.list-not-found") });
    }
    if (!list.public && list.groupId !== activeMembership.groupId) {
        return fail(404, { success: false, message: $t("errors.user-not-in-group") });
    }

    // const formData = await request.formData();
    // console.log(formData);
    // const form = itemFormSchema.safeParse(extractFormData(formData));

    // if (!form.success) {
    //     z.treeifyError(form.error);
    //     return fail(400, { errors: z.flattenError(form.error).fieldErrors });
    // }
    const { url, imageUrl, image, name, price, currency, quantity, note, lists: desiredLists, mostWanted } = data;

    let newImageFile: string | undefined | null;
    if (image && isValidImage(image)) {
        newImageFile = await createImage(name, image);
    } else if (imageUrl) {
        newImageFile = await createImage(name, imageUrl);
    }

    let itemPriceId = null;
    if (price && currency) {
        await client.itemPrice
            .create({
                data: {
                    value: getMinorUnits(price, currency, getLocale()),
                    currency: currency
                }
            })
            .then((itemPrice) => (itemPriceId = itemPrice.id));
    }

    const listIds = desiredLists.map(({ id }) => id);
    const lists = await client.list.findMany({
        select: {
            id: true,
            ownerId: true,
            groupId: true,
            managers: {
                select: {
                    userId: true
                }
            }
        },
        where: {
            id: {
                in: listIds
            }
        }
    });

    const nextDisplayOrderByList = await getNextDisplayOrderForLists(listIds, mostWanted);

    const listItems: Prisma.ListItemUncheckedCreateWithoutItemInput[] = await Promise.all(
        lists.map(async (l) => {
            const config = await getConfig(l.groupId);
            return {
                listId: l.id,
                addedById: user.id,
                approved: determineApprovalStatus(config, l, user),
                displayOrder: nextDisplayOrderByList[l.id] || 0
            };
        })
    );

    const item = await client.item.create({
        data: {
            userId: list.owner.id,
            name,
            url,
            note,
            imageUrl: newImageFile,
            createdById: user.id,
            itemPriceId,
            quantity,
            mostWanted,
            lists: {
                create: listItems
            }
        },
        include: getItemInclusions()
    });

    itemEmitter.emit(ItemEvent.ITEM_CREATE, item);

    const redirectTo = requestUrl.searchParams.get("redirectTo");
    redirect(302, redirectTo || "/");
});

interface PartialList extends Pick<List, "id" | "groupId" | "ownerId"> {
    managers: { userId: string }[];
}

const determineApprovalStatus = (config: Config, list: PartialList, user: LocalUser) => {
    if (list.ownerId === user.id || config.suggestions.method !== "approval") {
        return true;
    }

    return list.managers.some(({ userId }) => userId === user.id);
};
