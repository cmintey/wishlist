-- DropIndex
DROP INDEX "key_user_id_idx";

-- DropIndex
DROP INDEX "key_id_key";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'changeme@email.com',
    "picture" TEXT,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "hashedPassword" TEXT NOT NULL,
    CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user" ("email", "id", "name", "picture", "roleId", "username", "hashedPassword") 
SELECT "email", u."id", "name", "picture", "roleId", "username", "hashed_password"
FROM "user" u
JOIN "key" k on k.user_id = u.id;
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";

CREATE UNIQUE INDEX "user_id_key" ON "user"("id");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- DropTable
DROP TABLE "key";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
