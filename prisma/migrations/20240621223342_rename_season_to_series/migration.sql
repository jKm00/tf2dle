/*
  Warnings:

  - You are about to drop the column `season` on the `DailyUnusuals` table. All the data in the column will be lost.
  - Added the required column `series` to the `DailyUnusuals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyUnusuals" DROP COLUMN "season",
ADD COLUMN     "series" TEXT NOT NULL;
