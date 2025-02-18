-- CreateTable
CREATE TABLE "list_item_claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listItemId" TEXT NOT NULL,
    "claimedById" TEXT,
    "publicClaimedById" TEXT,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "list_item_claim_listItemId_fkey" FOREIGN KEY ("listItemId") REFERENCES "list_item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_publicClaimedById_fkey" FOREIGN KEY ("publicClaimedById") REFERENCES "system_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "list_item_claim"
SELECT li.itemId || COALESCE(i.pledgedById, i.publicPledgedById) as "id", li.id as "listItemId", i.pledgedById as "claimedById", i.publicPledgedById as "publicClaimedById", i.purchased as "purchased"
FROM "items" i
JOIN "list_item" li ON li.itemId = i.id
WHERE i.pledgedById IS NOT NULL OR i.publicPledgedById IS NOT NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_list_item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "addedById" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER,
    CONSTRAINT "list_item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_list_item" ("addedById", "approved", "id", "itemId", "listId", "displayOrder") 
SELECT li."addedById", li."approved", li."id", li."itemId", li."listId", i."displayOrder"
FROM "list_item" li
JOIN "items" i ON i.id = li.itemId;

DROP TABLE "list_item";
ALTER TABLE "new_list_item" RENAME TO "list_item";

CREATE UNIQUE INDEX "list_item_id_key" ON "list_item"("id");
CREATE INDEX "list_item_listId_idx" ON "list_item"("listId");
CREATE INDEX "list_item_itemId_idx" ON "list_item"("itemId");
CREATE UNIQUE INDEX "list_item_listId_itemId_key" ON "list_item"("listId", "itemId");

CREATE TABLE "new_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" TEXT,
    "itemPriceId" TEXT,
    "url" TEXT,
    "note" TEXT,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "items_itemPriceId_fkey" FOREIGN KEY ("itemPriceId") REFERENCES "item_price" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_items" ("createdById", "id", "imageUrl", "itemPriceId", "name", "note", "price", "url", "userId") 
SELECT "createdById", "id", "imageUrl", "itemPriceId", "name", "note", "price", "url", "userId" 
FROM "items";

DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";

CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "list_item_claim_id_key" ON "list_item_claim"("id");

-- CreateIndex
CREATE INDEX "list_item_claim_listItemId_idx" ON "list_item_claim"("listItemId");

-- CreateIndex
CREATE INDEX "list_item_claim_claimedById_idx" ON "list_item_claim"("claimedById");
