/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `pending_match` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `raw_advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `raw_leaderboard_block` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `raw_observable_advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `raw_observable_advertisement_backlog` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `raw_recent_match` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `pending_match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `raw_advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `raw_leaderboard_block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `raw_observable_advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `raw_observable_advertisement_backlog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `raw_recent_match` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "IDX_tt68e51ffaf47285b168278edf";

-- DropIndex
DROP INDEX "IDX_pp68e51ffaf47285b168278edf";

-- DropIndex
DROP INDEX "IDX_ss68e51ffaf47285b168278edf";

-- DropIndex
DROP INDEX "IDX_qq68e51ffaf47285b168278edf";

-- DropIndex
DROP INDEX "IDX_ee68e51ffaf47285b168278edf";

-- DropIndex
DROP INDEX "IDX_rr68e51ffaf47285b168278edf";

-- AlterTable
ALTER TABLE "pending_match" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "raw_advertisement" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "raw_leaderboard_block" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "raw_observable_advertisement" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "raw_observable_advertisement_backlog" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "raw_recent_match" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "IDX_tt68e51ffaf47285b168278edf" ON "pending_match"("updated_at");

-- CreateIndex
CREATE INDEX "IDX_pp68e51ffaf47285b168278edf" ON "raw_advertisement"("updated_at");

-- CreateIndex
CREATE INDEX "IDX_ss68e51ffaf47285b168278edf" ON "raw_leaderboard_block"("updated_at");

-- CreateIndex
CREATE INDEX "IDX_qq68e51ffaf47285b168278edf" ON "raw_observable_advertisement"("updated_at");

-- CreateIndex
CREATE INDEX "IDX_ee68e51ffaf47285b168278edf" ON "raw_observable_advertisement_backlog"("updated_at");

-- CreateIndex
CREATE INDEX "IDX_rr68e51ffaf47285b168278edf" ON "raw_recent_match"("updated_at");
