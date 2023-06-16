-- AlterTable
ALTER TABLE "raw_advertisement" ADD COLUMN     "error" TEXT,
ADD COLUMN     "error_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "raw_observable_advertisement" ADD COLUMN     "error" TEXT,
ADD COLUMN     "error_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "raw_observable_advertisement_backlog" ADD COLUMN     "error" TEXT,
ADD COLUMN     "error_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "raw_profile" ADD COLUMN     "error" TEXT,
ADD COLUMN     "error_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "raw_recent_match" ADD COLUMN     "error" TEXT,
ADD COLUMN     "error_at" TIMESTAMP(3);
