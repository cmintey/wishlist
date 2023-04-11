-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user_group_membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "user_group_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_group_membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_group_membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_signup_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresIn" INTEGER NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT NOT NULL DEFAULT 'global'
);
INSERT INTO "new_signup_tokens" ("createdAt", "expiresIn", "hashedToken", "id", "redeemed") SELECT "createdAt", "expiresIn", "hashedToken", "id", "redeemed" FROM "signup_tokens";
DROP TABLE "signup_tokens";
ALTER TABLE "new_signup_tokens" RENAME TO "signup_tokens";
CREATE UNIQUE INDEX "signup_tokens_id_key" ON "signup_tokens"("id");
CREATE INDEX "signup_tokens_hashedToken_idx" ON "signup_tokens"("hashedToken");
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
    CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "items_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "items_pledgedById_fkey" FOREIGN KEY ("pledgedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_items" ("addedById", "approved", "id", "image_url", "name", "note", "pledgedById", "price", "purchased", "url", "userId") SELECT "addedById", "approved", "id", "image_url", "name", "note", "pledgedById", "price", "purchased", "url", "userId" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_id_key" ON "items"("id");
CREATE INDEX "items_userId_idx" ON "items"("userId");
CREATE TABLE "new_system_config" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "groupId" TEXT NOT NULL,

    PRIMARY KEY ("key", "groupId")
);
INSERT INTO "new_system_config" ("key", "value", "groupId") SELECT "key", "value", "global" FROM "system_config";
DROP TABLE "system_config";
ALTER TABLE "new_system_config" RENAME TO "system_config";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "group_id_key" ON "group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "group_name_key" ON "group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_group_membership_id_key" ON "user_group_membership"("id");
