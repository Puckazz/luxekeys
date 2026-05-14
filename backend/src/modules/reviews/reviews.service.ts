import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  Prisma,
  ReviewStatus,
  UserRole,
} from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import { buildOrderBy } from '../../common/utils/query.util.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  BulkUpdateAdminReviewStatusDto,
  GetAdminReviewsQueryDto,
  UpdateAdminReviewStatusDto,
} from './dto/admin-review.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import {
  ADMIN_REVIEW_INCLUDE,
  AdminReviewRecord,
  REVIEW_DETAIL_INCLUDE,
  REVIEW_LIST_INCLUDE,
  ReviewDetail,
  ReviewSummary,
} from './interfaces/review.interface.js';

type AdminReviewStatusSummary = Record<ReviewStatus | 'all', number>;

type AdminReviewResponse = {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  reviewerName: string;
  reviewerEmail: string;
  title: string | null;
  content: string | null;
  rating: number;
  helpfulCount: number;
  status: ReviewStatus;
  moderationNote: string | null;
  moderatedAt: Date | null;
  moderatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByProduct(
    productId: string,
    query: GetReviewsQueryDto,
  ): Promise<PaginatedResponse<ReviewSummary>> {
    await this.assertProductExists(productId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 6;
    const skip = (page - 1) * limit;
    const where: Prisma.ReviewWhereInput = {
      productId,
      deletedAt: null,
      status: ReviewStatus.PUBLISHED,
    };
    const orderBy = buildOrderBy<Prisma.ReviewOrderByWithRelationInput>(
      ['rating', 'createdAt', 'updatedAt'],
      'createdAt',
      query.sortBy,
      query.sortOrder,
    );

    const [total, data] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: REVIEW_LIST_INCLUDE,
      }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(
    productId: string,
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewDetail> {
    await this.assertProductExists(productId);
    await this.assertPurchasedProduct(userId, productId, dto.orderItemId);

    const existingReview = await this.prisma.review.findFirst({
      where: { orderItemId: dto.orderItemId },
    });

    if (existingReview) {
      throw new ConflictException(
        'This purchase already has a review. Please update the existing review instead.',
      );
    }

    return this.prisma.review.create({
      data: {
        productId,
        userId,
        orderItemId: dto.orderItemId,
        rating: dto.rating,
        title: dto.title ?? null,
        content: dto.content ?? null,
      },
      include: REVIEW_DETAIL_INCLUDE,
    });
  }

  async update(
    productId: string,
    id: string,
    userId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewDetail> {
    const review = await this.findOneForProduct(productId, id);
    this.assertOwnership(review.userId, userId);

    return this.prisma.review.update({
      where: { id },
      data: {
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
      include: REVIEW_DETAIL_INCLUDE,
    });
  }

  async remove(
    productId: string,
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<ReviewDetail> {
    await this.findOneForProduct(productId, id);

    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can moderate reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: REVIEW_DETAIL_INCLUDE,
    });
  }

  async findAllAdmin(query: GetAdminReviewsQueryDto): Promise<{
    data: { items: AdminReviewResponse[]; summary: AdminReviewStatusSummary };
    pagination: PaginatedResponse<AdminReviewResponse>['pagination'];
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 7;
    const skip = (page - 1) * limit;
    const baseWhere: Prisma.ReviewWhereInput = {
      deletedAt: null,
      ...this.buildAdminSearchWhere(query.search),
    };
    const filteredWhere: Prisma.ReviewWhereInput = {
      ...baseWhere,
      ...(query.status && { status: query.status }),
    };
    const orderBy = buildOrderBy<Prisma.ReviewOrderByWithRelationInput>(
      ['createdAt', 'updatedAt', 'rating', 'helpfulCount'],
      'createdAt',
      query.sortBy,
      query.sortOrder,
    );

    const [summaryReviews, total, reviews] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: baseWhere,
        select: { status: true },
      }),
      this.prisma.review.count({ where: filteredWhere }),
      this.prisma.review.findMany({
        where: filteredWhere,
        orderBy,
        skip,
        take: limit,
        include: ADMIN_REVIEW_INCLUDE,
      }),
    ]);

    return {
      data: {
        items: reviews.map((review) => this.mapAdminReview(review)),
        summary: this.buildAdminSummary(summaryReviews),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneAdmin(id: string): Promise<AdminReviewResponse> {
    const review = await this.findAdminReview(id);

    return this.mapAdminReview(review);
  }

  async updateStatusAdmin(
    id: string,
    adminId: string,
    dto: UpdateAdminReviewStatusDto,
  ): Promise<AdminReviewResponse> {
    await this.findAdminReview(id);

    const review = await this.prisma.review.update({
      where: { id },
      data: {
        status: dto.status,
        moderationNote: dto.moderationNote?.trim() || null,
        moderatedAt: new Date(),
        moderatedById: adminId,
      },
      include: ADMIN_REVIEW_INCLUDE,
    });

    return this.mapAdminReview(review);
  }

  async bulkUpdateStatusAdmin(
    adminId: string,
    dto: BulkUpdateAdminReviewStatusDto,
  ): Promise<{ updatedCount: number }> {
    const result = await this.prisma.review.updateMany({
      where: {
        id: { in: dto.reviewIds },
        deletedAt: null,
      },
      data: {
        status: dto.status,
        moderationNote: dto.moderationNote?.trim() || null,
        moderatedAt: new Date(),
        moderatedById: adminId,
      },
    });

    return { updatedCount: result.count };
  }

  private buildAdminSearchWhere(search?: string): Prisma.ReviewWhereInput {
    const normalizedSearch = search?.trim();

    if (!normalizedSearch) {
      return {};
    }

    return {
      OR: [
        { title: { contains: normalizedSearch, mode: 'insensitive' } },
        { content: { contains: normalizedSearch, mode: 'insensitive' } },
        {
          product: {
            name: { contains: normalizedSearch, mode: 'insensitive' },
          },
        },
        {
          user: {
            fullName: { contains: normalizedSearch, mode: 'insensitive' },
          },
        },
        {
          user: {
            email: { contains: normalizedSearch, mode: 'insensitive' },
          },
        },
      ],
    };
  }

  private buildAdminSummary(
    reviews: Array<{ status: ReviewStatus }>,
  ): AdminReviewStatusSummary {
    return reviews.reduce<AdminReviewStatusSummary>(
      (summary, review) => {
        summary.all += 1;
        summary[review.status] += 1;
        return summary;
      },
      {
        all: 0,
        PENDING: 0,
        PUBLISHED: 0,
        HIDDEN: 0,
        REJECTED: 0,
      },
    );
  }

  private async findAdminReview(id: string): Promise<AdminReviewRecord> {
    const review = await this.prisma.review.findFirst({
      where: { id, deletedAt: null },
      include: ADMIN_REVIEW_INCLUDE,
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return review;
  }

  private mapAdminReview(review: AdminReviewRecord): AdminReviewResponse {
    return {
      id: review.id,
      productId: review.productId,
      productName: review.product.name,
      productImage: review.product.thumbnailUrl,
      reviewerName: review.user.fullName,
      reviewerEmail: review.user.email,
      title: review.title,
      content: review.content,
      rating: review.rating,
      helpfulCount: review.helpfulCount,
      status: review.status,
      moderationNote: review.moderationNote,
      moderatedAt: review.moderatedAt,
      moderatedById: review.moderatedById,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  private async findOneForProduct(
    productId: string,
    id: string,
  ): Promise<ReviewDetail> {
    const review = await this.prisma.review.findFirst({
      where: { id, productId, deletedAt: null },
      include: REVIEW_DETAIL_INCLUDE,
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    return review;
  }

  private async assertProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }
  }

  private async assertPurchasedProduct(
    userId: string,
    productId: string,
    orderItemId: string,
  ): Promise<void> {
    const item = await this.prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        productId,
        order: { userId, status: OrderStatus.DELIVERED },
      },
      select: { id: true },
    });

    if (!item) {
      throw new BadRequestException(
        'You can only review items from your delivered orders',
      );
    }
  }

  private assertOwnership(ownerId: string, requesterId: string): void {
    if (ownerId !== requesterId) {
      throw new ForbiddenException('You do not have access to this review');
    }
  }
}
