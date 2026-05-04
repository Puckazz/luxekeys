-- AlterTable ProductImage: rename url → imageUrl, add cloudinaryPublicId
ALTER TABLE "ProductImage" RENAME COLUMN "url" TO "imageUrl";

ALTER TABLE "ProductImage"
ADD COLUMN "cloudinaryPublicId" TEXT;
