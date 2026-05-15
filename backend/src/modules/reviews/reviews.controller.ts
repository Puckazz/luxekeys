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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/index.js';
import { CurrentUser } from '../../common/decorators/index.js';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/index.js';
import { UserRole } from '../../generated/prisma/index.js';
import type { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import {
  BulkUpdateAdminReviewStatusDto,
  GetAdminReviewsQueryDto,
  UpdateAdminReviewStatusDto,
} from './dto/admin-review.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { ReviewsService } from './reviews.service.js';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List reviews for a product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Paginated list of product reviews' })
  findAllByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: GetReviewsQueryDto,
  ) {
    return this.reviewsService.findAllByProduct(productId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Write a review for a purchased product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, user.id, dto);
  }

  @Get('eligibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check whether current user can review a product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Review eligibility for current user' })
  getEligibility(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewsService.getEligibility(productId, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review (owner only)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(productId, id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a review (admin moderation only)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewsService.remove(productId, id, user.id, user.role);
  }
}

@ApiTags('Admin — Reviews')
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@ApiBearerAuth()
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List reviews for admin moderation' })
  @ApiOkResponse({ description: 'Paginated admin review list' })
  findAll(@Query() query: GetAdminReviewsQueryDto) {
    return this.reviewsService.findAllAdmin(query);
  }

  @Patch('bulk-status')
  @ApiOperation({ summary: 'Update review moderation status in bulk (admin)' })
  @ApiOkResponse({ description: 'Bulk moderation result' })
  bulkUpdateStatus(
    @CurrentUser() user: AuthUser,
    @Body() dto: BulkUpdateAdminReviewStatusDto,
  ) {
    return this.reviewsService.bulkUpdateStatusAdmin(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review detail for admin moderation' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Admin review detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOneAdmin(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update review moderation status (admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Updated review' })
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminReviewStatusDto,
  ) {
    return this.reviewsService.updateStatusAdmin(id, user.id, dto);
  }
}
