import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockCart,
  createMockCartItem,
  createMockVariant,
  createMockProduct,
  uuid,
} from '../../common/testing/index.js';

const buildCartWithItems = (
  userId: string,
  items: ReturnType<typeof createMockCartItem>[] = [],
) => ({
  ...createMockCart({ userId }),
  items: items.map((item) => ({
    ...item,
    variant: {
      ...createMockVariant({ id: item.variantId }),
      product: createMockProduct(),
    },
    switchOption: null,
  })),
});

describe('CartService', () => {
  let service: CartService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<CartService>(CartService);
  });

  // ─── getCart ────────────────────────────────────────────────────────────────

  describe('getCart', () => {
    it('should return the existing cart with calculated subtotal', async () => {
      const userId = uuid();
      const variantId = uuid();
      const item = createMockCartItem({ variantId, quantity: 2 });
      const cart = buildCartWithItems(userId, [item]);
      (cart.items[0].variant as ReturnType<typeof createMockVariant>).price =
        '50.00';

      prisma.cart.findUnique.mockResolvedValue(cart as never);

      const result = await service.getCart(userId);

      expect(result.itemCount).toBe(2);
      expect(result.subtotal).toBeCloseTo(100);
    });

    it('should use switch option price when calculating subtotal', async () => {
      const userId = uuid();
      const variantId = uuid();
      const switchOptionId = uuid();
      const item = createMockCartItem({
        variantId,
        switchOptionId,
        quantity: 2,
      });
      const cart = {
        ...createMockCart({ userId }),
        items: [
          {
            ...item,
            variant: {
              ...createMockVariant({ id: variantId, price: '50.00' }),
              product: createMockProduct(),
            },
            switchOption: {
              id: switchOptionId,
              variantId,
              name: 'Oil King',
              switchType: 'Linear',
              price: '65.00',
              compareAtPrice: '75.00',
              stock: 10,
              isDefault: true,
              sortOrder: 0,
              isActive: true,
              deletedAt: null,
              createdAt: new Date(),
            },
          },
        ],
      };

      prisma.cart.findUnique.mockResolvedValue(cart as never);

      const result = await service.getCart(userId);

      expect(result.subtotal).toBeCloseTo(130);
      expect(result.items[0].variant.price).toBe(65);
      expect(result.items[0].switchOption?.price).toBe(65);
    });

    it('should auto-create a cart when user has none', async () => {
      const userId = uuid();
      const newCart = buildCartWithItems(userId);
      prisma.cart.findUnique.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue(newCart as never);

      const result = await service.getCart(userId);

      expect(prisma.cart.create).toHaveBeenCalled();
      expect(result.items).toHaveLength(0);
    });
  });

  // ─── addItem ────────────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('should add a new item to the cart', async () => {
      const userId = uuid();
      const variantId = uuid();
      const variant = createMockVariant({
        id: variantId,
        stock: 10,
        isActive: true,
      });
      const cart = buildCartWithItems(userId);

      prisma.productVariant.findUnique.mockResolvedValue({
        ...variant,
        product: createMockProduct(),
      } as never);
      prisma.cart.findUnique.mockResolvedValue(cart as never);
      prisma.cartItem.findFirst.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue(
        createMockCartItem({ variantId }) as never,
      );
      // getCart will be called after
      prisma.cart.findUnique.mockResolvedValue(
        buildCartWithItems(userId, [
          createMockCartItem({ variantId }),
        ]) as never,
      );

      const result = await service.addItem(userId, {
        variantId,
        quantity: 2,
      } as never);
      expect(result).toHaveProperty('items');
    });

    it('should increment quantity when item already exists', async () => {
      const userId = uuid();
      const variantId = uuid();
      const existingItem = createMockCartItem({ variantId, quantity: 3 });
      const variant = createMockVariant({
        id: variantId,
        stock: 20,
        isActive: true,
      });
      const cart = createMockCart({ userId });

      prisma.productVariant.findUnique.mockResolvedValue({
        ...variant,
        product: createMockProduct(),
      } as never);
      prisma.cart.findUnique.mockResolvedValue(cart as never);
      prisma.cartItem.findFirst.mockResolvedValue(existingItem as never);
      prisma.cartItem.update.mockResolvedValue({
        ...existingItem,
        quantity: 5,
      } as never);
      prisma.cart.findUnique.mockResolvedValue(
        buildCartWithItems(userId) as never,
      );

      await service.addItem(userId, { variantId, quantity: 2 } as never);
      expect(prisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantity: 5 }),
        }),
      );
    });

    it('should throw NotFoundException when variant not found', async () => {
      prisma.productVariant.findUnique.mockResolvedValue(null);
      await expect(
        service.addItem(uuid(), { variantId: uuid(), quantity: 1 } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when variant is inactive', async () => {
      const variant = createMockVariant({ isActive: false });
      prisma.productVariant.findUnique.mockResolvedValue({
        ...variant,
        product: createMockProduct(),
      } as never);

      await expect(
        service.addItem(uuid(), {
          variantId: variant.id,
          quantity: 1,
        } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when quantity exceeds stock', async () => {
      const variant = createMockVariant({ isActive: true, stock: 5 });
      prisma.productVariant.findUnique.mockResolvedValue({
        ...variant,
        product: createMockProduct(),
      } as never);
      prisma.cart.findUnique.mockResolvedValue(createMockCart() as never);
      prisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.addItem(uuid(), {
          variantId: variant.id,
          quantity: 10,
        } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── updateItem ─────────────────────────────────────────────────────────────

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      const userId = uuid();
      const cart = createMockCart({ userId });
      const variant = createMockVariant({ stock: 20, isActive: true });
      // cartItem.cartId MUST match cart.id
      const cartItem = createMockCartItem({
        cartId: cart.id,
        variantId: variant.id,
      });

      // First call: updateItem calls cart.findUnique
      // Second call: getCart calls cart.findUnique
      prisma.cart.findUnique
        .mockResolvedValueOnce(cart as never)
        .mockResolvedValueOnce(buildCartWithItems(userId) as never);
      prisma.cartItem.findUnique.mockResolvedValue({
        ...cartItem,
        variant,
        switchOption: null,
      } as never);
      prisma.cartItem.update.mockResolvedValue({
        ...cartItem,
        quantity: 5,
      } as never);

      await service.updateItem(userId, cartItem.id, { quantity: 5 } as never);
      expect(prisma.cartItem.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when cart not found', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      await expect(
        service.updateItem(uuid(), uuid(), { quantity: 1 } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when item not in cart', async () => {
      const userId = uuid();
      const cart = createMockCart({ userId });
      prisma.cart.findUnique.mockResolvedValue(cart as never);
      // Item belongs to a different cart
      prisma.cartItem.findUnique.mockResolvedValue(
        createMockCartItem({ cartId: uuid() }) as never,
      );

      await expect(
        service.updateItem(userId, uuid(), { quantity: 1 } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when quantity exceeds stock', async () => {
      const userId = uuid();
      const cart = createMockCart({ userId });
      const variant = createMockVariant({ stock: 3, isActive: true });
      const item = createMockCartItem({
        cartId: cart.id,
        variantId: variant.id,
      });

      prisma.cart.findUnique.mockResolvedValue(cart as never);
      prisma.cartItem.findUnique.mockResolvedValue({
        ...item,
        variant,
        switchOption: null,
      } as never);

      await expect(
        service.updateItem(userId, item.id, { quantity: 10 } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── removeItem ─────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const userId = uuid();
      const cart = createMockCart({ userId });
      // cartItem.cartId MUST match cart.id
      const item = createMockCartItem({ cartId: cart.id });

      // First call: removeItem calls cart.findUnique
      // Second call: getCart calls cart.findUnique
      prisma.cart.findUnique
        .mockResolvedValueOnce(cart as never)
        .mockResolvedValueOnce(buildCartWithItems(userId) as never);
      prisma.cartItem.findUnique.mockResolvedValue(item as never);
      prisma.cartItem.delete.mockResolvedValue(item as never);

      const result = await service.removeItem(userId, item.id);
      expect(prisma.cartItem.delete).toHaveBeenCalled();
      expect(result).toHaveProperty('items');
    });

    it('should throw NotFoundException when item not in cart', async () => {
      const userId = uuid();
      const cart = createMockCart({ userId });
      prisma.cart.findUnique.mockResolvedValue(cart as never);
      // Item belongs to different cart
      prisma.cartItem.findUnique.mockResolvedValue(
        createMockCartItem({ cartId: uuid() }) as never,
      );

      await expect(service.removeItem(userId, uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── clearCart ──────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('should delete all cart items and return { cleared: true }', async () => {
      const userId = uuid();
      const cart = createMockCart({ userId });
      prisma.cart.findUnique.mockResolvedValue(cart as never);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 } as never);

      const result = await service.clearCart(userId);
      expect(result).toEqual({ cleared: true });
      expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when cart not found', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      await expect(service.clearCart(uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
