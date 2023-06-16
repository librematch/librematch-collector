-- CreateTable
CREATE TABLE "raw_profile" (
    "match_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_profile_pkey" PRIMARY KEY ("match_id")
);

-- CreateIndex
CREATE INDEX "IDX_aa68e51ffaf47285b168278edf" ON "raw_profile"("updated_at");
