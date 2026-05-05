import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class GetReviewsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['rating', 'createdAt', 'updatedAt'] })
  @IsOptional()
  @IsString()
  sortBy?: string;
}
