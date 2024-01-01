-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_group_membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "user_group_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_group_membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_group_membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_group_membership" ("active", "groupId", "id", "roleId", "userId") SELECT "active", "groupId", "id", "roleId", "userId" FROM "user_group_membership";
DROP TABLE "user_group_membership";
ALTER TABLE "new_user_group_membership" RENAME TO "user_group_membership";
CREATE UNIQUE INDEX "user_group_membership_id_key" ON "user_group_membership"("id");
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
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT,
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "items_pledgedById_fkey" FOREIGN KEY ("pledgedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_items" ("addedById", "approved", "groupId", "id", "image_url", "name", "note", "pledgedById", "price", "purchased", "url", "userId") SELECT "addedById", "approved", "groupId", "id", "image_url", "name", "note", "pledgedById", "price", "purchased", "url", "userId" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
