import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { createMockCategory, uuid } from '../../common/testing/index.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: jest.Mocked<CategoriesService>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findTree: jest.fn(),
      findProductsByCategory: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<CategoriesService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: service }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
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
    const category = createMockCategory({ id });
    service.findOne.mockResolvedValue(category as never);

    const result = await controller.findOne(id);
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(result).toBe(category);
  });

  it('findTree should delegate to service.findTree', async () => {
    service.findTree.mockResolvedValue([]);
    const result = await controller.findTree();
    expect(service.findTree).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('create should delegate to service.create', async () => {
    const category = createMockCategory();
    service.create.mockResolvedValue(category as never);

    const result = await controller.create({ name: 'Keyboards' } as never);
    expect(service.create).toHaveBeenCalledWith({ name: 'Keyboards' });
    expect(result).toBe(category);
  });

  it('update should delegate to service.update', async () => {
    const id = uuid();
    const category = createMockCategory({ id, name: 'Updated' });
    service.update.mockResolvedValue(category as never);

    const result = await controller.update(id, { name: 'Updated' } as never);
    expect(service.update).toHaveBeenCalledWith(id, { name: 'Updated' });
    expect(result).toBe(category);
  });

  it('remove should delegate to service.remove', async () => {
    const id = uuid();
    const category = createMockCategory({ id, deletedAt: new Date() });
    service.remove.mockResolvedValue(category as never);

    const result = await controller.remove(id);
    expect(service.remove).toHaveBeenCalledWith(id);
    expect(result).toBe(category);
  });
});
