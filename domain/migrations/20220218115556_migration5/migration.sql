-- AlterTable
ALTER TABLE "leaderboard_row" ADD COLUMN     "drops" INTEGER,
ADD COLUMN     "losses" INTEGER,
ADD COLUMN     "streak" INTEGER,
ADD COLUMN     "wins" INTEGER;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "smaller_profile" ADD COLUMN     "country" TEXT;
