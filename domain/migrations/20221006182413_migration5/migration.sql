/*
  Warnings:

  - You are about to alter the column `rating` on the `rating` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `rating_diff` on the `rating` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "rating" ALTER COLUMN "rating" SET DATA TYPE SMALLINT,
ALTER COLUMN "rating_diff" SET DATA TYPE SMALLINT;
