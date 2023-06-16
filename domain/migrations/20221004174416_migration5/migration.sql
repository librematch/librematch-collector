/*
  Warnings:

  - The primary key for the `rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `leaderboard_id` to the `rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rating" DROP CONSTRAINT "rating_pkey",
ADD COLUMN     "leaderboard_id" INTEGER NOT NULL,
ADD CONSTRAINT "rating_pkey" PRIMARY KEY ("leaderboard_id", "profile_id", "games");
