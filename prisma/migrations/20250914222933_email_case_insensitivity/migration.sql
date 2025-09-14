PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL COLLATE NOCASE,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'changeme@email.com' COLLATE NOCASE,
    "picture" TEXT,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "hashedPassword" TEXT NOT NULL, 
    "oauthId" TEXT, 
    "preferredLanguage" TEXT,
    CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_user" ("id", "username", "name", "email", "picture", "roleId", "hashedPassword", "oauthId", "preferredLanguage")
SELECT "id", "username", "name", "email", "picture", "roleId", "hashedPassword", "oauthId", "preferredLanguage"
FROM "user";

DROP TABLE "user";

ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
