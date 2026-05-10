import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { createMockCart, uuid } from '../../common/testing/index.js';

describe('CartController', () => {
  let controller: CartController;
  let service: jest.Mocked<CartService>;

  beforeEach(async () => {
    service = {
      getCart: jest.fn(),
      syncCart: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    } as unknown as jest.Mocked<CartService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: service }],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getCart should delegate to service.getCart', async () => {
    const cart = createMockCart();
    service.getCart.mockResolvedValue(cart as never);

    const user = { id: cart.userId };
    const result = await controller.getCart(user as never);
    expect(service.getCart).toHaveBeenCalledWith(user.id);
    expect(result).toBe(cart);
  });

  it('syncCart should delegate to service.syncCart', async () => {
    const cart = createMockCart();
    service.syncCart.mockResolvedValue(cart as never);

    const user = { id: cart.userId };
    const result = await controller.syncCart(
      user as never,
      { items: [] } as never,
    );
    expect(service.syncCart).toHaveBeenCalledWith(user.id, { items: [] });
    expect(result).toBe(cart);
  });

  it('addItem should delegate to service.addItem', async () => {
    const cart = createMockCart();
    service.addItem.mockResolvedValue(cart as never);

    const user = { id: cart.userId };
    const result = await controller.addItem(
      user as never,
      { variantId: uuid(), quantity: 1 } as never,
    );
    expect(service.addItem).toHaveBeenCalled();
    expect(result).toBe(cart);
  });

  it('updateItem should delegate to service.updateItem', async () => {
    const cart = createMockCart();
    service.updateItem.mockResolvedValue(cart as never);

    const itemId = uuid();
    const user = { id: cart.userId };
    const result = await controller.updateItem(user as never, itemId, {
      quantity: 2,
    } as never);
    expect(service.updateItem).toHaveBeenCalledWith(user.id, itemId, {
      quantity: 2,
    });
    expect(result).toBe(cart);
  });

  it('removeItem should delegate to service.removeItem', async () => {
    const cart = createMockCart();
    service.removeItem.mockResolvedValue(cart as never);

    const itemId = uuid();
    const user = { id: cart.userId };
    const result = await controller.removeItem(user as never, itemId);
    expect(service.removeItem).toHaveBeenCalledWith(user.id, itemId);
    expect(result).toBe(cart);
  });

  it('clearCart should delegate to service.clearCart', async () => {
    service.clearCart.mockResolvedValue({ cleared: true } as never);

    const user = { id: uuid() };
    const result = await controller.clearCart(user as never);
    expect(service.clearCart).toHaveBeenCalledWith(user.id);
    expect(result).toEqual({ cleared: true });
  });
});
