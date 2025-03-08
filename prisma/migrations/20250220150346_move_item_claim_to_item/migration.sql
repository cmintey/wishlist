-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_list_item_claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" INTEGER NOT NULL,
    "listId" TEXT NOT NULL,
    "claimedById" TEXT,
    "publicClaimedById" TEXT,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "list_item_claim_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_item_claim_publicClaimedById_fkey" FOREIGN KEY ("publicClaimedById") REFERENCES "system_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_list_item_claim" ("claimedById", "id", "publicClaimedById", "purchased", "itemId", "listId") 
SELECT lic."claimedById", lic."id", lic."publicClaimedById", lic."purchased", li."itemId", li."listId"
FROM "list_item_claim" lic
JOIN "list_item" li on lic.listItemId = li.id;

DROP TABLE "list_item_claim";
ALTER TABLE "new_list_item_claim" RENAME TO "list_item_claim";
CREATE UNIQUE INDEX "list_item_claim_id_key" ON "list_item_claim"("id");
CREATE INDEX "list_item_claim_itemId_idx" ON "list_item_claim"("itemId");
CREATE INDEX "list_item_claim_claimedById_idx" ON "list_item_claim"("claimedById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
