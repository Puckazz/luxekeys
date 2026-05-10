import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller.js';
import { WishlistService } from './wishlist.service.js';
import { createMockWishlistItem, uuid } from '../../common/testing/index.js';

describe('WishlistController', () => {
  let controller: WishlistController;
  let service: jest.Mocked<WishlistService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<WishlistService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [{ provide: WishlistService, useValue: service }],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to service.findAll', async () => {
    const items = [createMockWishlistItem()];
    service.findAll.mockResolvedValue(items as never);

    const user = { id: uuid() };
    const result = await controller.findAll(user as never);
    expect(service.findAll).toHaveBeenCalledWith(user.id);
    expect(result).toBe(items);
  });

  it('add should delegate to service.add', async () => {
    const item = createMockWishlistItem();
    service.add.mockResolvedValue(item as never);

    const user = { id: item.userId };
    const result = await controller.add(
      user as never,
      { productId: item.productId } as never,
    );
    expect(service.add).toHaveBeenCalled();
    expect(result).toBe(item);
  });

  it('remove should delegate to service.remove', async () => {
    service.remove.mockResolvedValue({ removed: true } as never);

    const user = { id: uuid() };
    const productId = uuid();
    const result = await controller.remove(user as never, productId);
    expect(service.remove).toHaveBeenCalledWith(user.id, productId);
    expect(result).toEqual({ removed: true });
  });
});
