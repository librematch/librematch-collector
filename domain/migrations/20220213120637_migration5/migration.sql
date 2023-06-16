-- CreateTable
CREATE TABLE "raw_advertisement" (
    "match_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_advertisement_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "pending_profile" (
    "profile_id" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "lobby" (
    "match_id" INTEGER NOT NULL,
    "name" TEXT,
    "started" TIMESTAMP(3),
    "finished" TIMESTAMP(3),
    "server" TEXT,
    "difficulty" INTEGER,
    "starting_age" INTEGER NOT NULL,
    "full_tech_tree" BOOLEAN NOT NULL,
    "allow_cheats" BOOLEAN NOT NULL,
    "empire_wars_mode" BOOLEAN NOT NULL,
    "ending_age" INTEGER NOT NULL,
    "game_mode" INTEGER NOT NULL,
    "lock_speed" BOOLEAN NOT NULL,
    "lock_teams" BOOLEAN NOT NULL,
    "map_size" INTEGER NOT NULL,
    "location" INTEGER NOT NULL,
    "population" INTEGER NOT NULL,
    "record_game" BOOLEAN NOT NULL,
    "regicide_mode" BOOLEAN NOT NULL,
    "resources" INTEGER NOT NULL,
    "shared_exploration" BOOLEAN NOT NULL,
    "speed" INTEGER NOT NULL,
    "sudden_death_mode" BOOLEAN NOT NULL,
    "team_positions" BOOLEAN NOT NULL,
    "team_together" BOOLEAN NOT NULL,
    "treaty_length" INTEGER NOT NULL,
    "turbo_mode" BOOLEAN NOT NULL,
    "victory" INTEGER NOT NULL,
    "reveal_map" INTEGER NOT NULL,

    CONSTRAINT "lobby_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "lobby_player" (
    "match_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "civ" INTEGER,
    "team" INTEGER,
    "color" INTEGER,
    "is_ready" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "won" BOOLEAN,

    CONSTRAINT "lobby_player_pkey" PRIMARY KEY ("match_id","profile_id","slot")
);

-- CreateIndex
CREATE INDEX "IDX_pp68e51ffaf47285b168278edf" ON "raw_advertisement"("updatedAt");

-- CreateIndex
CREATE INDEX "IDX_tt68e51ffaf47285b168278edf" ON "pending_profile"("updatedAt");

-- CreateIndex
CREATE INDEX "IDX_uu68e51ffaf47285b168278edf" ON "lobby"("finished");

-- CreateIndex
CREATE INDEX "IDX_uub6cfca8139b9aa85880aab9e" ON "lobby"("started");

-- CreateIndex
CREATE INDEX "IDX_kkafd2c450f166eacbdf982841" ON "lobby_player"("match_id");

-- CreateIndex
CREATE INDEX "IDX_kk3de28aa98207f3a21145feb8" ON "lobby_player"("profile_id");

-- AddForeignKey
ALTER TABLE "lobby_player" ADD CONSTRAINT "lobby_player_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "lobby"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;
