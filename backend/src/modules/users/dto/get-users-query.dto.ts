import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { UserRole, UserStatus } from '../../../generated/prisma/index.js';

export const ADMIN_USER_STATUS_FILTERS = [
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.SUSPENDED,
  'ARCHIVED',
] as const;
export type AdminUserStatusFilter = (typeof ADMIN_USER_STATUS_FILTERS)[number];

export const ADMIN_USER_SORT_OPTIONS = [
  'newest',
  'name-asc',
  'name-desc',
  'email-asc',
] as const;
export type AdminUserSortOption = (typeof ADMIN_USER_SORT_OPTIONS)[number];

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

export class GetAdminUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by account status',
    enum: ADMIN_USER_STATUS_FILTERS,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ADMIN_USER_STATUS_FILTERS)
  status?: AdminUserStatusFilter;

  @ApiPropertyOptional({
    description: 'Search by email or fullName',
    type: String,
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ADMIN_USER_SORT_OPTIONS,
    description: 'Admin sort option',
  })
  @IsOptional()
  @IsEnum(ADMIN_USER_SORT_OPTIONS)
  sort?: AdminUserSortOption;
}
