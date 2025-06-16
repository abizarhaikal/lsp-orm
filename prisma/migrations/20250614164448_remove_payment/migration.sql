/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentStatus` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_order_id_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentStatus" VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE "Payment";
