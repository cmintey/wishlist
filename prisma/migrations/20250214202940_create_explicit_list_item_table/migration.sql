-- CreateTable
CREATE TABLE "list_item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "addedById" TEXT NOT NULL,
    CONSTRAINT "list_item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "list_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "list_item_userId_fkey" FOREIGN KEY ("addedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "list_item"
SELECT itl.b || itl.a AS "id", itl.b AS "listId", itl.a AS "itemId", i.approved AS "approved", i.addedById
FROM _ItemToList itl
JOIN items i ON itl.a = i.id;

-- DropIndex
DROP INDEX "_ItemToList_B_index";

-- DropIndex
DROP INDEX "_ItemToList_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ItemToList";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "pledgedById" TEXT,
    "publicPledgedById" TEXT,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    CONSTRAINT "items_itemPriceId_fkey" FOREIGN KEY ("itemPriceId") REFERENCES "item_price" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_pledgedById_fkey" FOREIGN KEY ("pledgedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_publicPledgedById_fkey" FOREIGN KEY ("publicPledgedById") REFERENCES "system_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_items" ("displayOrder", "id", "imageUrl", "itemPriceId", "name", "note", "pledgedById", "price", "publicPledgedById", "purchased", "url", "userId", "createdById") SELECT "displayOrder", "id", "imageUrl", "itemPriceId", "name", "note", "pledgedById", "price", "publicPledgedById", "purchased", "url", "userId", "addedById" AS "createdById" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");
CREATE INDEX "items_pledgedById_idx" ON "items"("pledgedById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "list_item_id_key" ON "list_item"("id");

-- CreateIndex
CREATE INDEX "list_item_listId_idx" ON "list_item"("listId");

-- CreateIndex
CREATE INDEX "list_item_itemId_idx" ON "list_item"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "list_item_listId_itemId_key" ON "list_item"("listId", "itemId");
