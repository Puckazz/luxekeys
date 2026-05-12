import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '../../generated/prisma/index.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import { buildOrderBy } from '../../common/utils/query.util.js';
import { PrismaService } from '../database/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import {
  REVIEW_DETAIL_INCLUDE,
  REVIEW_LIST_INCLUDE,
  ReviewDetail,
  ReviewSummary,
} from './interfaces/review.interface.js';

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
    const where: Prisma.ReviewWhereInput = { productId, deletedAt: null };
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
