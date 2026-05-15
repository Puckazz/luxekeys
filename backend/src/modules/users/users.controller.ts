import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
  CreateAdminUserDto,
  GetAdminUsersQueryDto,
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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user (Admin only)' })
  @ApiOkResponse({
    description: 'Created user profile',
    type: Object,
  })
  createAdminUser(
    @Body() dto: CreateAdminUserDto,
  ): Promise<UserProfile> {
    return this.usersService.createAdminUser(dto);
  }

  @Get('management')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users for management (Admin only)' })
  @ApiOkResponse({
    description: 'Paginated management user list',
    type: Object,
  })
  findManagementUsers(@Query() query: GetAdminUsersQueryDto) {
    return this.usersService.findManagementUsers(query);
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
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfile> {
    return this.usersService.updateUser(actor, id, dto);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore archived user (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Restored user profile',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  restore(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserProfile> {
    return this.usersService.restore(actor, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete user (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Archived user profile',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  softDelete(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserProfile> {
    return this.usersService.softDelete(actor, id);
  }
}
