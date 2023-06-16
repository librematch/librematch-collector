/*
  Warnings:

  - Added the required column `is_ready` to the `player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "player" ADD COLUMN     "color" INTEGER,
ADD COLUMN     "is_ready" INTEGER NOT NULL,
ADD COLUMN     "status" INTEGER NOT NULL;
