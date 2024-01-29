/*
  Warnings:

  - You are about to drop the column `gameModes` on the `DailyMaps` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `DailyMaps` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `DailyMaps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyMaps" DROP COLUMN "gameModes",
DROP COLUMN "image",
DROP COLUMN "releaseDate";
