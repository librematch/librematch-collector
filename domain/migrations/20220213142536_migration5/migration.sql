-- CreateTable
CREATE TABLE "pending_match2" (
    "match_id" INTEGER NOT NULL,
    "profile_ids" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_match2_pkey" PRIMARY KEY ("match_id")
);

-- CreateIndex
CREATE INDEX "IDX_ff68e51ffaf47285b168278edf" ON "pending_match2"("updated_at");
