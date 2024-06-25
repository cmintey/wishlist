-- CreateTable
CREATE TABLE "system_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT DEFAULT 'Anonymous'
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" TEXT,
    "url" TEXT,
    "note" TEXT,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "pledgedById" TEXT,
    "publicPledgedById" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_pledgedById_fkey" FOREIGN KEY ("pledgedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_publicPledgedById_fkey" FOREIGN KEY ("publicPledgedById") REFERENCES "system_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_items" ("addedById", "approved", "groupId", "id", "imageUrl", "name", "note", "pledgedById", "price", "purchased", "url", "userId") SELECT "addedById", "approved", "groupId", "id", "imageUrl", "name", "note", "pledgedById", "price", "purchased", "url", "userId" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");
CREATE INDEX "items_pledgedById_idx" ON "items"("pledgedById");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "system_user_id_key" ON "system_user"("id");
