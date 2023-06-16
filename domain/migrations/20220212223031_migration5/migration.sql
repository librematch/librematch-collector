/*
  Warnings:

  - The `last_match_time` column on the `leaderboard_row` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "leaderboard_row" DROP COLUMN "last_match_time",
ADD COLUMN     "last_match_time" TIMESTAMP(3);
