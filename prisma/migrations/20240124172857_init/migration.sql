-- CreateTable
CREATE TABLE "DailyMaps" (
    "id" SERIAL NOT NULL,
    "selectedAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "startingPosX" DOUBLE PRECISION NOT NULL,
    "startingPosY" DOUBLE PRECISION NOT NULL,
    "gameModes" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "hasWon" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyMaps_pkey" PRIMARY KEY ("id")
);
