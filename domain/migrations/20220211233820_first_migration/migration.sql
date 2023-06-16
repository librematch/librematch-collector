-- CreateTable
CREATE TABLE "raw_observable_advertisement" (
    "match_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_observable_advertisement_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "match" (
    "match_id" INTEGER NOT NULL,
    "match_uuid" TEXT,
    "lobby_id" TEXT,
    "name" TEXT,
    "opened" INTEGER,
    "started" INTEGER,
    "finished" INTEGER,
    "duration" INTEGER,
    "duration_minutes" DOUBLE PRECISION,
    "notified" BOOLEAN NOT NULL DEFAULT false,
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

    CONSTRAINT "match_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "player" (
    "match_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "steam_id" TEXT,
    "civ" INTEGER,
    "clan" TEXT,
    "color" INTEGER,
    "country" TEXT,
    "drops" INTEGER,
    "games" INTEGER,
    "name" TEXT,
    "rating" INTEGER,
    "rating_change" INTEGER,
    "slot" INTEGER NOT NULL,
    "slot_type" INTEGER,
    "streak" INTEGER,
    "team" INTEGER,
    "wins" INTEGER,
    "won" BOOLEAN,

    CONSTRAINT "player_pkey" PRIMARY KEY ("match_id","profile_id","slot")
);

-- CreateIndex
CREATE INDEX "IDX_qq68e51ffaf47285b168278edf" ON "raw_observable_advertisement"("updatedAt");

-- CreateIndex
CREATE INDEX "IDX_ae68e51ffaf47285b168278edf" ON "match"("finished");

-- CreateIndex
CREATE INDEX "IDX_e7b6cfca8139b9aa85880aab9e" ON "match"("started");

-- CreateIndex
CREATE INDEX "IDX_58afd2c450f166eacbdf982841" ON "player"("match_id");

-- CreateIndex
CREATE INDEX "IDX_ba3de28aa98207f3a21145feb8" ON "player"("profile_id");

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;
