-- CreateTable
CREATE TABLE "raw_steam_profile" (
    "profile_id" INTEGER NOT NULL,
    "json" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "error_at" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "raw_steam_profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateIndex
CREATE INDEX "IDX_bb68e51ffaf47285b168278edf" ON "raw_steam_profile"("updated_at");
