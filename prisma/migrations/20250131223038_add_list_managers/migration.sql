-- CreateTable
CREATE TABLE "_ManagedLists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ManagedLists_A_fkey" FOREIGN KEY ("A") REFERENCES "list" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ManagedLists_B_fkey" FOREIGN KEY ("B") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ManagedLists_AB_unique" ON "_ManagedLists"("A", "B");

-- CreateIndex
CREATE INDEX "_ManagedLists_B_index" ON "_ManagedLists"("B");
