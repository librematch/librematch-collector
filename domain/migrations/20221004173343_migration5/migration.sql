-- CreateTable
CREATE TABLE "rating" (
    "profile_id" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("profile_id","games")
);
