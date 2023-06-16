-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "last_match_time" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "leaderboard_row" ADD CONSTRAINT "leaderboard_row_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;
