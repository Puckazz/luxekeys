import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller.js';
import { AddressesService } from './addresses.service.js';
import { createMockAddress, uuid } from '../../common/testing/index.js';

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: jest.Mocked<AddressesService>;

  beforeEach(async () => {
    service = {
      findAllByUser: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      setDefault: jest.fn(),
    } as unknown as jest.Mocked<AddressesService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: service }],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to service.findAllByUser', async () => {
    const addresses = [createMockAddress()];
    service.findAllByUser.mockResolvedValue(addresses as never);

    const user = { id: uuid() };
    const result = await controller.findAll(user as never);
    expect(service.findAllByUser).toHaveBeenCalledWith(user.id);
    expect(result).toBe(addresses);
  });

  it('create should delegate to service.create', async () => {
    const address = createMockAddress();
    service.create.mockResolvedValue(address as never);

    const user = { id: address.userId };
    const result = await controller.create(
      user as never,
      { city: 'HCM' } as never,
    );
    expect(service.create).toHaveBeenCalled();
    expect(result).toBe(address);
  });

  it('findOne should delegate to service.findOne', async () => {
    const address = createMockAddress();
    service.findOne.mockResolvedValue(address as never);

    const user = { id: address.userId };
    const result = await controller.findOne(address.id, user as never);
    expect(service.findOne).toHaveBeenCalledWith(address.id, user.id);
    expect(result).toBe(address);
  });

  it('update should delegate to service.update', async () => {
    const address = createMockAddress();
    service.update.mockResolvedValue(address as never);

    const user = { id: address.userId };
    const result = await controller.update(
      address.id,
      user as never,
      { city: 'HN' } as never,
    );
    expect(service.update).toHaveBeenCalled();
    expect(result).toBe(address);
  });

  it('remove should delegate to service.remove', async () => {
    const address = createMockAddress();
    service.remove.mockResolvedValue(address as never);

    const user = { id: address.userId };
    const result = await controller.remove(address.id, user as never);
    expect(service.remove).toHaveBeenCalledWith(address.id, user.id);
    expect(result).toBe(address);
  });

  it('setDefault should delegate to service.setDefault', async () => {
    const address = createMockAddress();
    service.setDefault.mockResolvedValue(address as never);

    const user = { id: address.userId };
    const result = await controller.setDefault(address.id, user as never);
    expect(service.setDefault).toHaveBeenCalledWith(address.id, user.id);
    expect(result).toBe(address);
  });
});
