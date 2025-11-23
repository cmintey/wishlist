/*
  Warnings:

  - You are about to drop the column `archived` on the `items` table. All the data in the column will be lost.

*/
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
    "quantity" INTEGER,
    "archivedById" TEXT,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "items_itemPriceId_fkey" FOREIGN KEY ("itemPriceId") REFERENCES "item_price" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_items" ("createdById", "id", "imageUrl", "itemPriceId", "name", "note", "price", "quantity", "url", "userId") SELECT "createdById", "id", "imageUrl", "itemPriceId", "name", "note", "price", "quantity", "url", "userId" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");
CREATE INDEX "items_archivedById_idx" ON "items"("archivedById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
