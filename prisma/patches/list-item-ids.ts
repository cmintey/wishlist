import { prisma } from "../client";
import { randomUUID } from "crypto";

const PATCH_ID = "list-item-ids";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isPatchApplied =
    (await prisma.patch.findUnique({
        where: {
            id: PATCH_ID
        }
    })) !== null;

if (isPatchApplied) {
    console.log("Skipping already applied patch: '%s'", PATCH_ID);
} else {
    const listItemsToUpdate = await prisma.listItem
        .findMany({
            select: {
                id: true
            }
        })
        .then((listItems) => listItems.filter((listItem) => listItem.id.match(UUID_PATTERN) === null))
        .then((listItems) => listItems.map((listItem) => ({ oldId: listItem.id, newId: randomUUID() })));

    const itemClaimsToUpdate = await prisma.itemClaim
        .findMany({
            select: {
                id: true
            }
        })
        .then((itemClaims) => itemClaims.filter((itemClaim) => itemClaim.id.match(UUID_PATTERN) === null))
        .then((itemClaims) => itemClaims.map((itemClaim) => ({ oldId: itemClaim.id, newId: randomUUID().toString() })));

    const listItemsActions = listItemsToUpdate.map((listItem) =>
        prisma.listItem.update({
            where: {
                id: listItem.oldId
            },
            data: {
                id: listItem.newId
            }
        })
    );

    const itemClaimsActions = itemClaimsToUpdate.map((itemClaim) =>
        prisma.itemClaim.update({
            where: {
                id: itemClaim.oldId
            },
            data: {
                id: itemClaim.newId
            }
        })
    );

    await prisma
        .$transaction([...listItemsActions, ...itemClaimsActions])
        .then(() =>
            prisma.patch.create({
                data: {
                    id: PATCH_ID
                }
            })
        )
        .then(() => console.log("Patch '%s' applied successfully.", PATCH_ID))
        .catch((e) => {
            console.error("Error applying patch '%s'", PATCH_ID);
            console.error(e);
        });
}

await prisma.$disconnect();
