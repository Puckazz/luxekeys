-- AlterTable
ALTER TABLE "ProductSwitchOption" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "ProductSwitchOption_isActive_idx" ON "ProductSwitchOption"("isActive");
