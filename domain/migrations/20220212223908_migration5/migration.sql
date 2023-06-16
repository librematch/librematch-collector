/*
  Warnings:

  - The primary key for the `raw_leaderboard_block` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "raw_leaderboard_block" DROP CONSTRAINT "raw_leaderboard_block_pkey",
ADD COLUMN     "leaderboard_id" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "raw_leaderboard_block_pkey" PRIMARY KEY ("leaderboard_id", "start");
