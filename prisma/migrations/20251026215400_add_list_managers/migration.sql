-- CreateTable
CREATE TABLE "list_manager" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    CONSTRAINT "list_manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_manager_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "list_manager_id_key" ON "list_manager"("id");

-- CreateIndex
CREATE INDEX "list_manager_listId_idx" ON "list_manager"("listId");
