-- CreateTable
CREATE TABLE "list" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "ownerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
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
SELECT userId || groupId AS id, NULL as name, userId AS ownerId, groupId, FALSE AS public
FROM user_group_membership

-- Add the existing items to the list relationship
INSERT INTO "_ItemToList" 
SELECT i.id, l.id
FROM "items" i
JOIN "list" l ON l.ownerId = i.userId AND l.groupId = i.groupId 