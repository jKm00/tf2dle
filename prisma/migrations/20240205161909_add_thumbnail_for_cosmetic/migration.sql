/*
  Warnings:

  - Added the required column `thumbnail` to the `DailyCosmetics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyCosmetics" ADD COLUMN     "thumbnail" TEXT NOT NULL;
