/*
  Warnings:

  - You are about to drop the `match_history_raw` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `match_observable_raw` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "match_history_raw";

-- DropTable
DROP TABLE "match_observable_raw";

-- CreateTable
CREATE TABLE "match_raw" (
    "match_id" INTEGER NOT NULL,
    "json" TEXT NOT NULL,

    CONSTRAINT "match_raw_pkey" PRIMARY KEY ("match_id")
);
