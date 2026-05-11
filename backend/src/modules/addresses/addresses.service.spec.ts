import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AddressesService } from './addresses.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockAddress,
  uuid,
} from '../../common/testing/index.js';

describe('AddressesService', () => {
  let service: AddressesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<AddressesService>(AddressesService);
  });

  // ─── findAllByUser ───────────────────────────────────────────────────────────

  describe('findAllByUser', () => {
    it('should return all addresses for the user', async () => {
      const userId = uuid();
      const addresses = [
        createMockAddress({ userId }),
        createMockAddress({ userId }),
      ];
      prisma.address.findMany.mockResolvedValue(addresses as never);

      const result = await service.findAllByUser(userId);
      expect(result).toHaveLength(2);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create an address', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      prisma.address.create.mockResolvedValue(address as never);

      const result = await service.create(userId, {
        fullName: 'Test User',
        phone: '0901234567',
        streetAddress: '123 Main St',
        province: 'HCM',
        city: 'District 1',
      } as never);

      expect(result.userId).toBe(userId);
    });

    it('should clear the previous default address when isDefault=true', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId, isDefault: true });
      prisma.address.updateMany.mockResolvedValue({ count: 1 } as never);
      prisma.address.create.mockResolvedValue(address as never);

      await service.create(userId, {
        fullName: 'Test',
        phone: '0901234567',
        streetAddress: '123',
        province: 'HCM',
        city: 'District 1',
        isDefault: true,
      } as never);

      expect(prisma.address.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId, isDefault: true }),
        }),
      );
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return an address when found and owned by user', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      prisma.address.findFirst.mockResolvedValue(address as never);

      const result = await service.findOne(address.id, userId);
      expect(result.id).toBe(address.id);
    });

    it('should throw NotFoundException when address not found', async () => {
      prisma.address.findFirst.mockResolvedValue(null);
      await expect(service.findOne(uuid(), uuid())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when address belongs to another user', async () => {
      const address = createMockAddress({ userId: uuid() });
      prisma.address.findFirst.mockResolvedValue(address as never);

      await expect(service.findOne(address.id, uuid())).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update address fields', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      const updated = createMockAddress({ userId, city: 'Hanoi' });

      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.address.update.mockResolvedValue(updated as never);

      const result = await service.update(address.id, userId, {
        city: 'Hanoi',
      } as never);
      expect(result.city).toBe('Hanoi');
    });

    it('should clear default addresses when isDefault=true', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.address.updateMany.mockResolvedValue({ count: 1 } as never);
      prisma.address.update.mockResolvedValue({
        ...address,
        isDefault: true,
      } as never);

      await service.update(address.id, userId, { isDefault: true } as never);
      expect(prisma.address.updateMany).toHaveBeenCalled();
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete address', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      const deleted = { ...address, deletedAt: new Date() };

      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.address.update.mockResolvedValue(deleted as never);

      const result = await service.remove(address.id, userId);
      expect(result.deletedAt).not.toBeNull();
    });

    it('should throw ForbiddenException when not owner', async () => {
      const address = createMockAddress({ userId: uuid() });
      prisma.address.findFirst.mockResolvedValue(address as never);

      await expect(service.remove(address.id, uuid())).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── setDefault ─────────────────────────────────────────────────────────────

  describe('setDefault', () => {
    it('should set the address as default and clear others', async () => {
      const userId = uuid();
      const address = createMockAddress({ userId });
      const updated = { ...address, isDefault: true };

      prisma.address.findFirst.mockResolvedValue(address as never);
      prisma.address.updateMany.mockResolvedValue({ count: 1 } as never);
      prisma.address.update.mockResolvedValue(updated as never);

      const result = await service.setDefault(address.id, userId);
      expect(result.isDefault).toBe(true);
      expect(prisma.address.updateMany).toHaveBeenCalled();
    });
  });
});
