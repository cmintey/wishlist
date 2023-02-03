-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
