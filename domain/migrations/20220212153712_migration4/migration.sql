/*
  Warnings:

  - Added the required column `allow_cheats` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empire_wars_mode` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ending_age` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_tech_tree` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_mode` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lock_speed` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lock_teams` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `map_size` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `population` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_game` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regicide_mode` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resources` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reveal_map` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shared_exploration` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speed` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `starting_age` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sudden_death_mode` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_positions` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_together` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treaty_length` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turbo_mode` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `victory` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match" ADD COLUMN     "allow_cheats" BOOLEAN NOT NULL,
ADD COLUMN     "difficulty" INTEGER NOT NULL,
ADD COLUMN     "empire_wars_mode" BOOLEAN NOT NULL,
ADD COLUMN     "ending_age" INTEGER NOT NULL,
ADD COLUMN     "full_tech_tree" BOOLEAN NOT NULL,
ADD COLUMN     "game_mode" INTEGER NOT NULL,
ADD COLUMN     "location" INTEGER NOT NULL,
ADD COLUMN     "lock_speed" BOOLEAN NOT NULL,
ADD COLUMN     "lock_teams" BOOLEAN NOT NULL,
ADD COLUMN     "map_size" INTEGER NOT NULL,
ADD COLUMN     "population" INTEGER NOT NULL,
ADD COLUMN     "record_game" BOOLEAN NOT NULL,
ADD COLUMN     "regicide_mode" BOOLEAN NOT NULL,
ADD COLUMN     "resources" INTEGER NOT NULL,
ADD COLUMN     "reveal_map" INTEGER NOT NULL,
ADD COLUMN     "shared_exploration" BOOLEAN NOT NULL,
ADD COLUMN     "speed" INTEGER NOT NULL,
ADD COLUMN     "starting_age" INTEGER NOT NULL,
ADD COLUMN     "sudden_death_mode" BOOLEAN NOT NULL,
ADD COLUMN     "team_positions" BOOLEAN NOT NULL,
ADD COLUMN     "team_together" BOOLEAN NOT NULL,
ADD COLUMN     "treaty_length" INTEGER NOT NULL,
ADD COLUMN     "turbo_mode" BOOLEAN NOT NULL,
ADD COLUMN     "victory" INTEGER NOT NULL;
