-- CreateTable
CREATE TABLE "DailyUnusuals" (
    "id" SERIAL NOT NULL,
    "selectedAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "rotation" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "hasWon" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyUnusuals_pkey" PRIMARY KEY ("id")
);
