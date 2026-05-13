ALTER TABLE "ProductSwitchOption"
ADD COLUMN "price" DECIMAL(12,2),
ADD COLUMN "compareAtPrice" DECIMAL(12,2);

UPDATE "ProductSwitchOption" AS "switchOption"
SET
  "price" = "variant"."price",
  "compareAtPrice" = "variant"."compareAtPrice"
FROM "ProductVariant" AS "variant"
WHERE "switchOption"."variantId" = "variant"."id";

ALTER TABLE "ProductSwitchOption"
ALTER COLUMN "price" SET NOT NULL;
