-- AlterTable
ALTER TABLE "match_raw" ADD COLUMN     "ongoing" BOOLEAN;

-- CreateIndex
CREATE INDEX "IDX_match_raw_ongoing" ON "match_raw"("ongoing");
