/*
  Warnings:

  - You are about to drop the column `purchase_item_id` on the `medicine_batches` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[medicine_id,batch_number]` on the table `medicine_batches` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "medicine_batches" DROP CONSTRAINT "medicine_batches_purchase_item_id_fkey";

-- DropIndex
DROP INDEX "medicine_batches_purchase_item_id_key";

-- AlterTable
ALTER TABLE "medicine_batches" DROP COLUMN "purchase_item_id";

-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "medicine_batch_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "medicine_batches_medicine_id_batch_number_key" ON "medicine_batches"("medicine_id", "batch_number");

-- CreateIndex
CREATE INDEX "purchase_items_medicine_batch_id_idx" ON "purchase_items"("medicine_batch_id");

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_medicine_batch_id_fkey" FOREIGN KEY ("medicine_batch_id") REFERENCES "medicine_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
