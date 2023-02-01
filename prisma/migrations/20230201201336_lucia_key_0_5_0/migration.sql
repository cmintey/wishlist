/*
  Warnings:

  - You are about to drop the column `expires` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `hashed_password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `provider_id` on the `user` table. All the data in the column will be lost.
  - Added the required column `active_expires` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "key" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    CONSTRAINT "key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Transfer data from user to key
INSERT INTO `key` (id, user_id, `primary`, hashed_password)
SELECT provider_id, id, 1, hashed_password
FROM user;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,
    CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_session" ("id", "idle_expires", "user_id", "active_expires") SELECT "id", "idle_expires", "user_id", "expires" FROM "session";
DROP TABLE "session";
ALTER TABLE "new_session" RENAME TO "session";
CREATE UNIQUE INDEX "session_id_key" ON "session"("id");
CREATE INDEX "session_user_id_idx" ON "session"("user_id");
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'changeme@email.com',
    "roleId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user" ("email", "id", "name", "roleId", "username") SELECT "email", "id", "name", "roleId", "username" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "key_id_key" ON "key"("id");

-- CreateIndex
CREATE INDEX "key_user_id_idx" ON "key"("user_id");
