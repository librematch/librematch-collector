-- CreateTable
CREATE TABLE "pending_profile" (
    "profile_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateIndex
CREATE INDEX "IDX_hh68e51ffaf47285b168278edf" ON "pending_profile"("updated_at");
