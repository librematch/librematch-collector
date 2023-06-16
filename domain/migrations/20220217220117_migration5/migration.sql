/*
  Warnings:

  - The primary key for the `smaller_player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `slot` on the `smaller_player` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `team` on the `smaller_player` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `color` on the `smaller_player` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "smaller_player" DROP CONSTRAINT "smaller_player_pkey",
ALTER COLUMN "slot" SET DATA TYPE SMALLINT,
ALTER COLUMN "team" SET DATA TYPE SMALLINT,
ALTER COLUMN "color" SET DATA TYPE SMALLINT,
ADD CONSTRAINT "smaller_player_pkey" PRIMARY KEY ("match_id", "profile_id", "slot");
