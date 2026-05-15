ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';

UPDATE "Review"
SET "status" = 'PUBLISHED'
WHERE "status" = 'PENDING'
  AND "deletedAt" IS NULL
  AND "moderatedAt" IS NULL;
