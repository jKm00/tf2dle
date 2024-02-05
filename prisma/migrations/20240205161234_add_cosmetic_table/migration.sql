-- CreateTable
CREATE TABLE "DailyCosmetics" (
    "id" SERIAL NOT NULL,
    "selectedAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "rotation" INTEGER NOT NULL,
    "hasWon" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyCosmetics_pkey" PRIMARY KEY ("id")
);
