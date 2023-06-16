/*
  Warnings:

  - You are about to drop the `pending_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "pending_profile";

-- CreateTable
CREATE TABLE "pending_match" (
    "match_id" INTEGER NOT NULL,
    "profile_ids" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_match_pkey" PRIMARY KEY ("match_id")
);

-- CreateIndex
CREATE INDEX "IDX_tt68e51ffaf47285b168278edf" ON "pending_match"("updatedAt");
