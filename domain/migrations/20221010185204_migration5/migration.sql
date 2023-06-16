/*
  Warnings:

  - You are about to drop the `lobby` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lobby_player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pending_match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pending_match2` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pending_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "lobby_player" DROP CONSTRAINT "lobby_player_match_id_fkey";

-- DropForeignKey
ALTER TABLE "lobby_player" DROP CONSTRAINT "lobby_player_profile_id_fkey";

-- AlterTable
ALTER TABLE "player" ADD COLUMN     "replay" BOOLEAN;

-- DropTable
DROP TABLE "lobby";

-- DropTable
DROP TABLE "lobby_player";

-- DropTable
DROP TABLE "pending_match";

-- DropTable
DROP TABLE "pending_match2";

-- DropTable
DROP TABLE "pending_profile";
