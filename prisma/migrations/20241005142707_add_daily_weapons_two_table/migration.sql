-- CreateTable
CREATE TABLE "DailyWeaponsTwo" (
    "id" SERIAL NOT NULL,
    "selectedAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "hasWon" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyWeaponsTwo_pkey" PRIMARY KEY ("id")
);
