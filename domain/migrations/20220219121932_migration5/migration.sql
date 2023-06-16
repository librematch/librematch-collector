/*
  Warnings:

  - You are about to drop the column `won` on the `lobby_player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lobby_player" DROP COLUMN "won";

-- AddForeignKey
ALTER TABLE "lobby_player" ADD CONSTRAINT "lobby_player_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;
