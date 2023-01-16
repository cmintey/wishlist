-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" TEXT,
    "url" TEXT,
    "note" TEXT,
    "image_url" TEXT,
    "userId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "pledgedById" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "items_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "items_pledgedById_fkey" FOREIGN KEY ("pledgedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_items" ("addedById", "id", "image_url", "name", "note", "pledgedById", "price", "url", "userId") SELECT "addedById", "id", "image_url", "name", "note", "pledgedById", "price", "url", "userId" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
