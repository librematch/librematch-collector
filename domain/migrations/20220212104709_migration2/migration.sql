/*
  Warnings:

  - You are about to drop the column `average_rating` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `cheats` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `duration_minutes` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `ending_age` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `expansion` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `full_tech_tree` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `game_type` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `has_custom_content` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `has_password` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `leaderboard_id` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `lobby_id` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `lock_speed` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `lock_teams` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `map_size` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `map_type` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `match_uuid` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `notified` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `num_players` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `num_slots` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `opened` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `pop` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `ranked` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `rating_type` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `rms` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `scenario` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `shared_exploration` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `speed` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `starting_age` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `team_positions` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `team_together` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `treaty_length` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `turbo` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `victory` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `victory_time` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `match` table. All the data in the column will be lost.
  - The `started` column on the `match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `finished` column on the `match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `clan` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `drops` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `games` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `rating_change` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `slot_type` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `steam_id` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `streak` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `won` on the `player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "match" DROP COLUMN "average_rating",
DROP COLUMN "cheats",
DROP COLUMN "duration",
DROP COLUMN "duration_minutes",
DROP COLUMN "ending_age",
DROP COLUMN "expansion",
DROP COLUMN "full_tech_tree",
DROP COLUMN "game_type",
DROP COLUMN "has_custom_content",
DROP COLUMN "has_password",
DROP COLUMN "leaderboard_id",
DROP COLUMN "lobby_id",
DROP COLUMN "lock_speed",
DROP COLUMN "lock_teams",
DROP COLUMN "map_size",
DROP COLUMN "map_type",
DROP COLUMN "match_uuid",
DROP COLUMN "notified",
DROP COLUMN "num_players",
DROP COLUMN "num_slots",
DROP COLUMN "opened",
DROP COLUMN "pop",
DROP COLUMN "ranked",
DROP COLUMN "rating_type",
DROP COLUMN "resources",
DROP COLUMN "rms",
DROP COLUMN "scenario",
DROP COLUMN "shared_exploration",
DROP COLUMN "speed",
DROP COLUMN "starting_age",
DROP COLUMN "team_positions",
DROP COLUMN "team_together",
DROP COLUMN "treaty_length",
DROP COLUMN "turbo",
DROP COLUMN "version",
DROP COLUMN "victory",
DROP COLUMN "victory_time",
DROP COLUMN "visibility",
DROP COLUMN "started",
ADD COLUMN     "started" TIMESTAMP(3),
DROP COLUMN "finished",
ADD COLUMN     "finished" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "player" DROP COLUMN "clan",
DROP COLUMN "color",
DROP COLUMN "country",
DROP COLUMN "drops",
DROP COLUMN "games",
DROP COLUMN "name",
DROP COLUMN "rating",
DROP COLUMN "rating_change",
DROP COLUMN "slot_type",
DROP COLUMN "steam_id",
DROP COLUMN "streak",
DROP COLUMN "wins",
DROP COLUMN "won";

-- CreateIndex
CREATE INDEX "IDX_ae68e51ffaf47285b168278edf" ON "match"("finished");

-- CreateIndex
CREATE INDEX "IDX_e7b6cfca8139b9aa85880aab9e" ON "match"("started");
