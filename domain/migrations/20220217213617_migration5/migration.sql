/*
  Warnings:

  - You are about to alter the column `leaderboard_id` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `num_slots` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `map_type` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `average_rating` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `ending_age` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `game_type` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `num_players` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `rating_type` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `resources` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `speed` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `starting_age` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `treaty_length` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `victory` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `visibility` on the `smaller_match` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "smaller_match" ALTER COLUMN "leaderboard_id" SET DATA TYPE SMALLINT,
ALTER COLUMN "num_slots" SET DATA TYPE SMALLINT,
ALTER COLUMN "map_type" SET DATA TYPE SMALLINT,
ALTER COLUMN "average_rating" SET DATA TYPE SMALLINT,
ALTER COLUMN "ending_age" SET DATA TYPE SMALLINT,
ALTER COLUMN "game_type" SET DATA TYPE SMALLINT,
ALTER COLUMN "num_players" SET DATA TYPE SMALLINT,
ALTER COLUMN "rating_type" SET DATA TYPE SMALLINT,
ALTER COLUMN "resources" SET DATA TYPE SMALLINT,
ALTER COLUMN "speed" SET DATA TYPE SMALLINT,
ALTER COLUMN "starting_age" SET DATA TYPE SMALLINT,
ALTER COLUMN "treaty_length" SET DATA TYPE SMALLINT,
ALTER COLUMN "victory" SET DATA TYPE SMALLINT,
ALTER COLUMN "visibility" SET DATA TYPE SMALLINT;
