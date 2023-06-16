/*
  Warnings:

  - You are about to drop the column `ongoing` on the `match_raw` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "IDX_match_raw_ongoing";

-- AlterTable
ALTER TABLE "match_raw" DROP COLUMN "ongoing";
