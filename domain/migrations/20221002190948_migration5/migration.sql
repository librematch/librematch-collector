-- CreateTable
CREATE TABLE "match_observable_raw" (
    "match_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,

    CONSTRAINT "match_observable_raw_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "match_history_raw" (
    "match_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,

    CONSTRAINT "match_history_raw_pkey" PRIMARY KEY ("match_id")
);
