-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_list" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "ownerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "hideOwner" BOOLEAN NOT NULL DEFAULT false,
    "allowSelfClaims" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "iconColor" TEXT,
    "description" TEXT,
    CONSTRAINT "list_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_list" ("description", "groupId", "hideOwner", "icon", "iconColor", "id", "name", "ownerId", "public") SELECT "description", "groupId", "hideOwner", "icon", "iconColor", "id", "name", "ownerId", "public" FROM "list";
DROP TABLE "list";
ALTER TABLE "new_list" RENAME TO "list";
CREATE UNIQUE INDEX "list_id_key" ON "list"("id");
CREATE INDEX "list_ownerId_idx" ON "list"("ownerId");
CREATE INDEX "list_groupId_idx" ON "list"("groupId");
CREATE INDEX "list_ownerId_groupId_idx" ON "list"("ownerId", "groupId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
