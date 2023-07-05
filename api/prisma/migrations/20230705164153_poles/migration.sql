/*
  Warnings:

  - The primary key for the `Pole` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Pole" DROP CONSTRAINT "Pole_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Pole_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Pole_id_seq";
