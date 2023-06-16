-- AlterTable
ALTER TABLE "player" ADD COLUMN     "won" BOOLEAN;

-- CreateTable
CREATE TABLE "raw_recent_match" (
    "match_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_recent_match_pkey" PRIMARY KEY ("match_id")
);

-- CreateIndex
CREATE INDEX "IDX_rr68e51ffaf47285b168278edf" ON "raw_recent_match"("updatedAt");
