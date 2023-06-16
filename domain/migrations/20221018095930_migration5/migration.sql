-- CreateTable
CREATE TABLE "setting" (
    "component" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "setting_pkey" PRIMARY KEY ("component","key")
);
