import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { createMockUser } from '../../common/testing/index.js';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    service = {
      getAll: jest.fn(),
      getMe: jest.fn(),
      updateMe: jest.fn(),
      changePassword: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      softDelete: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAll should delegate to service.getAll', async () => {
    const paginated = {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    service.getAll.mockResolvedValue(paginated as never);

    const result = await controller.getAll({} as never);
    expect(service.getAll).toHaveBeenCalledWith({});
    expect(result).toBe(paginated);
  });

  it('getMe should delegate to service.getMe', async () => {
    const userObj = createMockUser();
    service.getMe.mockResolvedValue(userObj as never);
    const user = { id: userObj.id };
    const result = await controller.getMe(user as never);
    expect(service.getMe).toHaveBeenCalledWith(userObj.id);
    expect(result).toBe(userObj);
  });

  it('updateMe should delegate to service.updateMe', async () => {
    const userObj = createMockUser({ fullName: 'New Name' });
    service.updateMe.mockResolvedValue(userObj as never);
    const user = { id: userObj.id };
    const result = await controller.updateMe(
      user as never,
      { fullName: 'New Name' } as never,
    );
    expect(service.updateMe).toHaveBeenCalledWith(userObj.id, {
      fullName: 'New Name',
    });
    expect(result).toBe(userObj);
  });
});
