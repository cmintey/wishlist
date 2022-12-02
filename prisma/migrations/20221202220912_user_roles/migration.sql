-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider_id" TEXT NOT NULL,
    "hashed_password" TEXT,
    "username" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user" ("firstname", "hashed_password", "id", "lastname", "provider_id", "username") SELECT "firstname", "hashed_password", "id", "lastname", "provider_id", "username" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");
CREATE UNIQUE INDEX "user_provider_id_key" ON "user"("provider_id");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Role_id_key" ON "Role"("id");
