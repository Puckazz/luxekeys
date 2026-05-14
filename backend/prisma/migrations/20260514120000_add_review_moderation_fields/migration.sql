-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED');

-- AlterTable
ALTER TABLE "Review"
ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "moderationNote" TEXT,
ADD COLUMN "moderatedAt" TIMESTAMP(3),
ADD COLUMN "moderatedById" TEXT,
ADD COLUMN "helpfulCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing public reviews so current shop pages keep showing them.
UPDATE "Review"
SET "status" = 'PUBLISHED'
WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_moderatedById_idx" ON "Review"("moderatedById");

-- AddForeignKey
ALTER TABLE "Review"
ADD CONSTRAINT "Review_moderatedById_fkey"
FOREIGN KEY ("moderatedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
