-- CreateTable
CREATE TABLE "patch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "patch_id_key" ON "patch"("id");
