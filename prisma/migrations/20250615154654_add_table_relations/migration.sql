/*
  Warnings:

  - You are about to drop the column `table_number` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `table_number` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "table_number",
ADD COLUMN     "table_id" UUID;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "table_number",
ADD COLUMN     "table_id" UUID;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
