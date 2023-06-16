-- AlterTable
ALTER TABLE "match" ADD COLUMN     "creator_profile_id" INTEGER;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_creator_profile_id_fkey" FOREIGN KEY ("creator_profile_id") REFERENCES "profile"("profile_id") ON DELETE SET NULL ON UPDATE CASCADE;
