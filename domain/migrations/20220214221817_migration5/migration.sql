/*
  Warnings:

  - The primary key for the `raw_profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `match_id` on the `raw_profile` table. All the data in the column will be lost.
  - Added the required column `profile_id` to the `raw_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "raw_profile" DROP CONSTRAINT "raw_profile_pkey",
DROP COLUMN "match_id",
ADD COLUMN     "profile_id" INTEGER NOT NULL,
ADD CONSTRAINT "raw_profile_pkey" PRIMARY KEY ("profile_id");
