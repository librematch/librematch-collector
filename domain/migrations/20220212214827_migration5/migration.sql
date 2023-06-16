-- CreateTable
CREATE TABLE "raw_leaderboard_block" (
    "start" INTEGER NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_leaderboard_block_pkey" PRIMARY KEY ("start")
);

-- CreateTable
CREATE TABLE "leaderboard_row" (
    "leaderboard_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" INTEGER,
    "rating" INTEGER,
    "last_match_time" INTEGER,

    CONSTRAINT "leaderboard_row_pkey" PRIMARY KEY ("leaderboard_id","profile_id")
);

-- CreateIndex
CREATE INDEX "IDX_ss68e51ffaf47285b168278edf" ON "raw_leaderboard_block"("updatedAt");

-- CreateIndex
CREATE INDEX "IDX_935515e6126c1a045608ca78b9" ON "leaderboard_row"("rating");
