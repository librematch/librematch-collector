-- AlterTable
ALTER TABLE "lobby" ALTER COLUMN "reveal_map" DROP NOT NULL;

-- AlterTable
ALTER TABLE "match" ALTER COLUMN "reveal_map" DROP NOT NULL;
