-- CreateTable
CREATE TABLE "Table" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Tersedia',

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);
