-- DropForeignKey
ALTER TABLE "lobby_player" DROP CONSTRAINT "lobby_player_match_id_fkey";

-- AddForeignKey
ALTER TABLE "lobby_player" ADD CONSTRAINT "lobby_player_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "lobby"("match_id") ON DELETE CASCADE ON UPDATE CASCADE;
