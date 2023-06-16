/*
  Warnings:

  - You are about to drop the column `rating` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `rating_diff` on the `player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "player" DROP COLUMN "rating",
DROP COLUMN "rating_diff";
