-- Add optional variant -> product image link for variant-specific thumbnails.
ALTER TABLE "ProductVariant"
ADD COLUMN "thumbnailImageId" TEXT;

CREATE INDEX "ProductVariant_thumbnailImageId_idx"
ON "ProductVariant"("thumbnailImageId");

ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_thumbnailImageId_fkey"
FOREIGN KEY ("thumbnailImageId")
REFERENCES "ProductImage"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
