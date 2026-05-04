import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { UserRole } from '../../../generated/prisma/index.js';

export class GetUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Search by email or fullName',
    type: String,
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
