import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from './brands.controller.js';
import { BrandsService } from './brands.service.js';
import { createMockBrand, uuid } from '../../common/testing/index.js';

describe('BrandsController', () => {
  let controller: BrandsController;
  let service: jest.Mocked<BrandsService>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findProductsByBrand: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<BrandsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [{ provide: BrandsService, useValue: service }],
    }).compile();

    controller = module.get<BrandsController>(BrandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to service.findAll', async () => {
    const paginated = {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    service.findAll.mockResolvedValue(paginated as never);

    const result = await controller.findAll({} as never);
    expect(service.findAll).toHaveBeenCalledWith({});
    expect(result).toBe(paginated);
  });

  it('findOne should delegate to service.findOne', async () => {
    const id = uuid();
    const brand = createMockBrand({ id });
    service.findOne.mockResolvedValue(brand as never);

    const result = await controller.findOne(id);
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(result).toBe(brand);
  });

  it('create should delegate to service.create', async () => {
    const brand = createMockBrand();
    service.create.mockResolvedValue(brand as never);

    const result = await controller.create({ name: 'Keychron' } as never);
    expect(service.create).toHaveBeenCalledWith({ name: 'Keychron' });
    expect(result).toBe(brand);
  });

  it('update should delegate to service.update', async () => {
    const id = uuid();
    const brand = createMockBrand({ id, name: 'Updated' });
    service.update.mockResolvedValue(brand as never);

    const result = await controller.update(id, { name: 'Updated' } as never);
    expect(service.update).toHaveBeenCalledWith(id, { name: 'Updated' });
    expect(result).toBe(brand);
  });

  it('remove should delegate to service.remove', async () => {
    const id = uuid();
    const brand = createMockBrand({ id, deletedAt: new Date() });
    service.remove.mockResolvedValue(brand as never);

    const result = await controller.remove(id);
    expect(service.remove).toHaveBeenCalledWith(id);
    expect(result).toBe(brand);
  });
});
