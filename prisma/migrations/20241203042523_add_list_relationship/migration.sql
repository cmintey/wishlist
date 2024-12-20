-- CreateTable
CREATE TABLE "list" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "ownerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "iconColor" TEXT,
    CONSTRAINT "list_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ItemToList" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ItemToList_A_fkey" FOREIGN KEY ("A") REFERENCES "items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ItemToList_B_fkey" FOREIGN KEY ("B") REFERENCES "list" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "list_id_key" ON "list"("id");

-- CreateIndex
CREATE INDEX "list_ownerId_idx" ON "list"("ownerId");

-- CreateIndex
CREATE INDEX "list_groupId_idx" ON "list"("groupId");

-- CreateIndex
CREATE INDEX "list_ownerId_groupId_idx" ON "list"("ownerId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "_ItemToList_AB_unique" ON "_ItemToList"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemToList_B_index" ON "_ItemToList"("B");

-- Create a new list for each user and group
INSERT INTO "list"
SELECT ugm.userId || ugm.groupId AS id, NULL AS name, ugm.userId AS ownerId, ugm.groupId, FALSE AS public, NULL AS icon, NULL AS iconColor
FROM "user_group_membership" ugm
LEFT JOIN "public_list" pl ON pl.userId = ugm.userId AND pl.groupId = ugm.groupId
WHERE pl.id IS NULL;

-- Copy over public lists
INSERT INTO "list"
SELECT id, NULL as name, userId AS ownerId, groupId, TRUE AS public, NULL AS icon, NULL AS iconColor
FROM "public_list";

-- Add the existing items to the list relationship
INSERT INTO "_ItemToList" 
SELECT i.id AS A, l.id AS B
FROM "items" i
JOIN "list" l ON l.ownerId = i.userId AND l.groupId = i.groupId;