-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_system_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT DEFAULT NULL,
    "name" TEXT DEFAULT 'ANONYMOUS_NAME'
);
INSERT INTO "new_system_user" ("id", "name", "username") SELECT "id", "name", "username" FROM "system_user";
DROP TABLE "system_user";
ALTER TABLE "new_system_user" RENAME TO "system_user";
CREATE UNIQUE INDEX "system_user_id_key" ON "system_user"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
