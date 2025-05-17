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
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "items_itemPriceId_fkey" FOREIGN KEY ("itemPriceId") REFERENCES "item_price" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_items" ("createdById", "id", "imageUrl", "itemPriceId", "name", "note", "price", "url", "userId") SELECT "createdById", "id", "imageUrl", "itemPriceId", "name", "note", "price", "url", "userId" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");
CREATE TABLE "new_list_item_claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" INTEGER NOT NULL,
    "listId" TEXT NOT NULL,
    "claimedById" TEXT,
    "publicClaimedById" TEXT,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "list_item_claim_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_publicClaimedById_fkey" FOREIGN KEY ("publicClaimedById") REFERENCES "system_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_list_item_claim" ("claimedById", "id", "itemId", "listId", "publicClaimedById", "purchased") SELECT "claimedById", "id", "itemId", "listId", "publicClaimedById", "purchased" FROM "list_item_claim";
DROP TABLE "list_item_claim";
ALTER TABLE "new_list_item_claim" RENAME TO "list_item_claim";
CREATE UNIQUE INDEX "list_item_claim_id_key" ON "list_item_claim"("id");
CREATE INDEX "list_item_claim_itemId_idx" ON "list_item_claim"("itemId");
CREATE INDEX "list_item_claim_claimedById_idx" ON "list_item_claim"("claimedById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
