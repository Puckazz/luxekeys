import { Test, TestingModule } from '@nestjs/testing';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdminProductsService } from './admin-products.service.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { createMockProduct, uuid } from '../../common/testing/index.js';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;
  let adminProductsService: jest.Mocked<AdminProductsService>;
  let adminInventoryService: jest.Mocked<AdminInventoryService>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySlug: jest.fn(),
      findFeatured: jest.fn(),
      findVariants: jest.fn(),
      findReviews: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ProductsService>;
    adminProductsService = {
      findAdminProducts: jest.fn(),
      createAdminProduct: jest.fn(),
      updateAdminProduct: jest.fn(),
      restoreAdminProduct: jest.fn(),
    } as unknown as jest.Mocked<AdminProductsService>;
    adminInventoryService = {
      findAdminInventory: jest.fn(),
      bulkUpdateAdminInventoryStock: jest.fn(),
    } as unknown as jest.Mocked<AdminInventoryService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: service },
        { provide: AdminProductsService, useValue: adminProductsService },
        { provide: AdminInventoryService, useValue: adminInventoryService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to service.findAll', async () => {
    const response = {
      data: { items: [], priceBounds: { min: 0, max: 0 } },
      pagination: { page: 1, limit: 6, total: 0, totalPages: 0 },
    };
    service.findAll.mockResolvedValue(response as never);

    const result = await controller.findAll({} as never);
    expect(service.findAll).toHaveBeenCalledWith({});
    expect(result).toBe(response);
  });

  it('findOne should delegate to service.findOne', async () => {
    const id = uuid();
    const product = { ...createMockProduct({ id }), averageRating: 4.5 };
    service.findOne.mockResolvedValue(product as never);

    const result = await controller.findOne(id);
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(result).toBe(product);
  });

  it('create should delegate to service.create', async () => {
    const product = createMockProduct();
    service.create.mockResolvedValue(product as never);

    const result = await controller.create({
      name: 'K2',
      type: 'KEYBOARD',
      basePrice: 99,
    } as never);
    expect(service.create).toHaveBeenCalled();
    expect(result).toBe(product);
  });

  it('update should delegate to service.update', async () => {
    const id = uuid();
    const product = createMockProduct({ id, name: 'Updated' });
    service.update.mockResolvedValue(product as never);

    const result = await controller.update(id, { name: 'Updated' } as never);
    expect(service.update).toHaveBeenCalledWith(id, { name: 'Updated' });
    expect(result).toBe(product);
  });

  it('remove should delegate to service.remove', async () => {
    const id = uuid();
    const product = { ...createMockProduct({ id }), deletedAt: new Date() };
    service.remove.mockResolvedValue(product as never);

    const result = await controller.remove(id);
    expect(service.remove).toHaveBeenCalledWith(id);
    expect(result).toBe(product);
  });
});
