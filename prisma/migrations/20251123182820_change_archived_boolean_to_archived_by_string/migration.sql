/*
  Warnings:

  - You are about to drop the column `archived` on the `items` table. All the data in the column will be lost.

*/
-- DropColumn and AddColumn
ALTER TABLE "items" DROP COLUMN "archived";
ALTER TABLE "items" ADD COLUMN "archivedById" TEXT;
CREATE INDEX "items_archivedById_idx" ON "items"("archivedById");
ALTER TABLE "items" ADD CONSTRAINT "items_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
