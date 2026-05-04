import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/index.js';
import { CurrentUser, Roles } from '../../common/decorators/index.js';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/index.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import type { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import {
  ChangePasswordDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UpdateUserProfileDto,
} from './dto/index.js';
import { UserListItem, UserProfile } from './interfaces/index.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiOkResponse({
    description: 'Paginated list of users',
    type: Object,
  })
  getAll(
    @Query() query: GetUsersQueryDto,
  ): Promise<PaginatedResponse<UserListItem>> {
    return this.usersService.getAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Current user profile',
    type: Object,
  })
  getMe(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({
    description: 'Updated user profile',
    type: Object,
  })
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
    type: Object,
  })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ passwordChanged: boolean }> {
    return this.usersService.changePassword(user.id, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'User profile',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserProfile> {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Updated user profile',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfile> {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete user (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'User deleted successfully',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  softDelete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ deleted: boolean }> {
    return this.usersService.softDelete(id);
  }
}
