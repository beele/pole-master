-- CreateTable
CREATE TABLE "Pole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "maxPower" DOUBLE PRECISION NOT NULL,
    "connectorCount" INTEGER NOT NULL,
    "inUse" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Pole_pkey" PRIMARY KEY ("id")
);
