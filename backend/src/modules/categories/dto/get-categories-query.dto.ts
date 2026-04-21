import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from '../../../common/decorators';
import {
  PaginationQueryDto,
  SortOrder,
} from '../../../common/dto/pagination-query.dto';

export type { SortOrder };

export const CATEGORY_SORT_FIELDS = ['createdAt', 'updatedAt', 'name'] as const;
export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[number];

export class GetCategoriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: CATEGORY_SORT_FIELDS,
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(CATEGORY_SORT_FIELDS)
  sortBy?: CategorySortField;
}
