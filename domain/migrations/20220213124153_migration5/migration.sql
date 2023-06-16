-- CreateTable
CREATE TABLE "raw_observable_advertisement_backlog" (
    "match_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_observable_advertisement_backlog_pkey" PRIMARY KEY ("match_id")
);

-- CreateIndex
CREATE INDEX "IDX_ee68e51ffaf47285b168278edf" ON "raw_observable_advertisement_backlog"("updatedAt");
