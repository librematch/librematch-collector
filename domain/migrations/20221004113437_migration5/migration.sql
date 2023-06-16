-- CreateTable
CREATE TABLE "match_pending" (
    "profile_id" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "match_pending_pkey" PRIMARY KEY ("profile_id")
);
