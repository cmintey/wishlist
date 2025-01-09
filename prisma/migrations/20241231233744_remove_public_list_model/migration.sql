/*
  Warnings:

  - You are about to drop the `public_list` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "public_list";
PRAGMA foreign_keys=on;
