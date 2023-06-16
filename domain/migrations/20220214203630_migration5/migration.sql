-- AlterTable
ALTER TABLE "match" ADD COLUMN     "internal_leaderboard_id" INTEGER,
ADD COLUMN     "leaderboard_id" INTEGER;

-- CreateTable
CREATE TABLE "profile" (
    "profile_id" INTEGER NOT NULL,
    "steam_id" TEXT,
    "name" TEXT NOT NULL,
    "clan" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("profile_id")
);

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;
