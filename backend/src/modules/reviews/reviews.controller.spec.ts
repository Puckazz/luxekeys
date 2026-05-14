import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { createMockReview, uuid } from '../../common/testing/index.js';
import { UserRole } from '../../generated/prisma/index.js';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: jest.Mocked<ReviewsService>;

  beforeEach(async () => {
    service = {
      findAllByProduct: jest.fn(),
      getEligibility: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ReviewsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: service }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllByProduct should delegate to service.findAllByProduct', async () => {
    const paginated = {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    service.findAllByProduct.mockResolvedValue(paginated as never);

    const productId = uuid();
    const result = await controller.findAllByProduct(productId, {} as never);
    expect(service.findAllByProduct).toHaveBeenCalledWith(productId, {});
    expect(result).toBe(paginated);
  });

  it('create should delegate to service.create', async () => {
    const review = createMockReview();
    service.create.mockResolvedValue(review as never);

    const user = { id: review.userId };
    const result = await controller.create(
      review.productId as string,
      user as never,
      { rating: 5 } as never,
    );
    expect(service.create).toHaveBeenCalled();
    expect(result).toBe(review);
  });

  it('getEligibility should delegate to service.getEligibility', async () => {
    const productId = uuid();
    const user = { id: uuid() };
    const eligibility = {
      canReview: true,
      hasDeliveredPurchase: true,
      reviewableItemCount: 1,
    };
    service.getEligibility.mockResolvedValue(eligibility as never);

    const result = await controller.getEligibility(productId, user as never);

    expect(service.getEligibility).toHaveBeenCalledWith(productId, user.id);
    expect(result).toBe(eligibility);
  });

  it('update should delegate to service.update', async () => {
    const review = createMockReview();
    service.update.mockResolvedValue(review as never);

    const user = { id: review.userId };
    const result = await controller.update(
      review.productId as string,
      review.id,
      user as never,
      { rating: 4 } as never,
    );
    expect(service.update).toHaveBeenCalled();
    expect(result).toBe(review);
  });

  it('remove should delegate to service.remove', async () => {
    const review = createMockReview();
    service.remove.mockResolvedValue(review as never);

    const user = { id: review.userId, role: UserRole.ADMIN };
    const result = await controller.remove(
      review.productId as string,
      review.id,
      user as never,
    );
    expect(service.remove).toHaveBeenCalled();
    expect(result).toBe(review);
  });
});
