/*
  Warnings:

  - Added the required column `reservation_date` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_time` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "reservation_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "reservation_time" TEXT NOT NULL;
