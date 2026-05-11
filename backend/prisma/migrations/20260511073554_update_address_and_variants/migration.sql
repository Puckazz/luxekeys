/*
  Warnings:

  - You are about to drop the column `district` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `line1` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `line2` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `ward` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `switchType` on the `ProductVariant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,variantId,switchOptionId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streetAddress` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CartItem_cartId_variantId_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "district",
DROP COLUMN "line1",
DROP COLUMN "line2",
DROP COLUMN "ward",
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "streetAddress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "switchOptionId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "switchOptionId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "switchType";

-- CreateTable
CREATE TABLE "ProductSwitchOption" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "switchType" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSwitchOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSwitchOption_variantId_idx" ON "ProductSwitchOption"("variantId");

-- CreateIndex
CREATE INDEX "CartItem_switchOptionId_idx" ON "CartItem"("switchOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_variantId_switchOptionId_key" ON "CartItem"("cartId", "variantId", "switchOptionId");

-- AddForeignKey
ALTER TABLE "ProductSwitchOption" ADD CONSTRAINT "ProductSwitchOption_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_switchOptionId_fkey" FOREIGN KEY ("switchOptionId") REFERENCES "ProductSwitchOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_switchOptionId_fkey" FOREIGN KEY ("switchOptionId") REFERENCES "ProductSwitchOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
