-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_system_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT DEFAULT 'anonymous',
    "name" TEXT DEFAULT 'Anonymous'
);
INSERT INTO "new_system_user" ("id", "name", "username") SELECT "id", "name", "username" FROM "system_user";
DROP TABLE "system_user";
ALTER TABLE "new_system_user" RENAME TO "system_user";
CREATE UNIQUE INDEX "system_user_id_key" ON "system_user"("id");
CREATE UNIQUE INDEX "system_user_username_name_key" ON "system_user"("username", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
