-- CreateTable
CREATE TABLE "smaller_match" (
    "match_id" INTEGER NOT NULL,
    "name" TEXT,
    "started" INTEGER,
    "finished" INTEGER,
    "leaderboard_id" INTEGER,
    "num_slots" INTEGER,
    "has_password" BOOLEAN,
    "server" TEXT,
    "map_type" INTEGER,
    "average_rating" INTEGER,
    "cheats" BOOLEAN,
    "ending_age" INTEGER,
    "expansion" TEXT,
    "full_tech_tree" BOOLEAN,
    "game_type" INTEGER,
    "has_custom_content" BOOLEAN,
    "lock_speed" BOOLEAN,
    "lock_teams" BOOLEAN,
    "map_size" INTEGER,
    "num_players" INTEGER,
    "pop" INTEGER,
    "ranked" BOOLEAN,
    "rating_type" INTEGER,
    "resources" INTEGER,
    "rms" TEXT,
    "scenario" TEXT,
    "shared_exploration" BOOLEAN,
    "speed" INTEGER,
    "starting_age" INTEGER,
    "team_positions" BOOLEAN,
    "team_together" BOOLEAN,
    "treaty_length" INTEGER,
    "turbo" BOOLEAN,
    "version" TEXT,
    "victory" INTEGER,
    "victory_time" INTEGER,
    "visibility" INTEGER,

    CONSTRAINT "smaller_match_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "smaller_player" (
    "match_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "civ" INTEGER,
    "team" INTEGER,
    "color" INTEGER,
    "is_ready" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "won" BOOLEAN,

    CONSTRAINT "smaller_player_pkey" PRIMARY KEY ("match_id","profile_id","slot")
);

-- CreateTable
CREATE TABLE "smaller_profile" (
    "profile_id" INTEGER NOT NULL,
    "steam_id" TEXT,
    "name" TEXT,
    "clan" TEXT,
    "last_match_time" TIMESTAMP(3),

    CONSTRAINT "smaller_profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateIndex
CREATE INDEX "IDX_smaller_ae68e51ffaf47285b168278edf" ON "smaller_match"("finished");

-- CreateIndex
CREATE INDEX "IDX_smaller_e7b6cfca8139b9aa85880aab9e" ON "smaller_match"("started");

-- CreateIndex
CREATE INDEX "IDX_smaller_58afd2c450f166eacbdf982841" ON "smaller_player"("match_id");

-- CreateIndex
CREATE INDEX "IDX_smaller_ba3de28aa98207f3a21145feb8" ON "smaller_player"("profile_id");

-- AddForeignKey
ALTER TABLE "smaller_player" ADD CONSTRAINT "smaller_player_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "smaller_match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smaller_player" ADD CONSTRAINT "smaller_player_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "smaller_profile"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;
