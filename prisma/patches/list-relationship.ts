import { prisma } from "../client";
import { init, isCuid } from "@paralleldrive/cuid2";

const PATCH_ID = "list-relationship";
const createId = init({
    length: 10
});

const isPatchApplied =
    (await prisma.patch.findUnique({
        where: {
            id: PATCH_ID
        }
    })) !== null;

if (isPatchApplied) {
    console.log("Skipping already applied patch: '%s'", PATCH_ID);
} else {
    const listsToUpdate = await prisma.list
        .findMany({
            select: {
                id: true
            }
        })
        .then((lists) => lists.filter((list) => !isCuid(list.id)))
        .then((lists) => lists.map((list) => ({ oldId: list.id, newId: createId() })));

    const actions = listsToUpdate.map((list) =>
        prisma.list.update({
            data: {
                id: list.newId
            },
            where: {
                id: list.oldId
            }
        })
    );

    await prisma
        .$transaction(actions)
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
