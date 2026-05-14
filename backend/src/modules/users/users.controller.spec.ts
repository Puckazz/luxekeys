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
      createAdminUser: jest.fn(),
      findManagementUsers: jest.fn(),
      getMe: jest.fn(),
      updateMe: jest.fn(),
      changePassword: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      restore: jest.fn(),
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

  it('createAdminUser should delegate to service.createAdminUser', async () => {
    const userObj = createMockUser();
    const dto = {
      email: userObj.email,
      fullName: userObj.fullName,
      password: 'password123',
      role: userObj.role,
      status: userObj.status,
    };
    service.createAdminUser.mockResolvedValue(userObj as never);

    const result = await controller.createAdminUser(dto as never);

    expect(service.createAdminUser).toHaveBeenCalledWith(dto);
    expect(result).toBe(userObj);
  });

  it('findManagementUsers should delegate to service.findManagementUsers', async () => {
    const response = {
      data: {
        items: [],
        summary: {
          all: 0,
          ACTIVE: 0,
          INACTIVE: 0,
          SUSPENDED: 0,
          ARCHIVED: 0,
        },
      },
      pagination: { page: 1, limit: 7, total: 0, totalPages: 1 },
    };
    service.findManagementUsers.mockResolvedValue(response as never);

    const result = await controller.findManagementUsers({} as never);

    expect(service.findManagementUsers).toHaveBeenCalledWith({});
    expect(result).toBe(response);
  });

  it('updateMe should delegate to service.updateMe', async () => {
    const userObj = createMockUser({
      fullName: 'New Name',
      phone: '0901234567',
    });
    service.updateMe.mockResolvedValue(userObj as never);
    const user = { id: userObj.id };
    const result = await controller.updateMe(
      user as never,
      { fullName: 'New Name', phone: '0901234567' } as never,
    );
    expect(service.updateMe).toHaveBeenCalledWith(userObj.id, {
      fullName: 'New Name',
      phone: '0901234567',
    });
    expect(result).toBe(userObj);
  });
});
