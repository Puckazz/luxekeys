import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ReviewStatus } from '../../../generated/prisma/index.js';

export const ADMIN_REVIEW_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'rating',
] as const;

export type AdminReviewSortField = (typeof ADMIN_REVIEW_SORT_FIELDS)[number];

export class GetAdminReviewsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by product, reviewer, title, or content',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ReviewStatus })
  @IsOptional()
  @IsIn(Object.values(ReviewStatus))
  status?: ReviewStatus;

  @ApiPropertyOptional({ enum: ADMIN_REVIEW_SORT_FIELDS })
  @IsOptional()
  @IsIn(ADMIN_REVIEW_SORT_FIELDS)
  sortBy?: AdminReviewSortField;
}

export class UpdateAdminReviewStatusDto {
  @ApiProperty({ enum: ReviewStatus })
  @IsIn(Object.values(ReviewStatus))
  status!: ReviewStatus;

  @ApiPropertyOptional({
    example: 'Spam or abusive content.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  moderationNote?: string;
}

export class BulkUpdateAdminReviewStatusDto extends UpdateAdminReviewStatusDto {
  @ApiProperty({
    type: [String],
    example: ['0f7f97d9-7dd2-45e4-81dc-f8f433f7a20d'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  reviewIds!: string[];
}
