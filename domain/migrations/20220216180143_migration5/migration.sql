/*
  Warnings:

  - You are about to drop the column `is_ready` on the `smaller_player` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `smaller_player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "smaller_player" DROP COLUMN "is_ready",
DROP COLUMN "status";
