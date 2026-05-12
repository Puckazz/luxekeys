import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PrismaService } from '../database/prisma.service.js';
import * as bcrypt from 'bcrypt';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockUser,
  uuid,
} from '../../common/testing/index.js';
import { UserRole } from '../../generated/prisma/index.js';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  // ─── getAll ─────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return paginated users', async () => {
      const users = [createMockUser(), createMockUser()];
      prisma.$transaction.mockResolvedValue([2, users] as never);

      const result = await service.getAll({} as never);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by role', async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);
      await service.getAll({ role: UserRole.ADMIN } as never);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should apply search filter', async () => {
      prisma.$transaction.mockResolvedValue([0, []] as never);
      await service.getAll({ search: 'john' } as never);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ─── getMe ──────────────────────────────────────────────────────────────────

  describe('getMe', () => {
    it('should return the user profile', async () => {
      const user = createMockUser();
      prisma.user.findUnique.mockResolvedValue(user as never);

      const result = await service.getMe(user.id);
      expect(result).toHaveProperty('id', user.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMe(uuid())).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateMe ───────────────────────────────────────────────────────────────

  describe('updateMe', () => {
    it('should update user profile fields', async () => {
      const user = createMockUser({
        fullName: 'Updated Name',
        phone: '0901234567',
      });
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue(user as never);

      const result = await service.updateMe(user.id, {
        fullName: 'Updated Name',
        phone: '0901234567',
      } as never);
      expect(result.fullName).toBe('Updated Name');
      expect(result.phone).toBe('0901234567');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fullName: 'Updated Name',
            phone: '0901234567',
          }),
        }),
      );
    });

    it('should store null when phone is submitted as empty string', async () => {
      const user = createMockUser({ phone: null });
      prisma.user.update.mockResolvedValue(user as never);

      await service.updateMe(user.id, {
        phone: '   ',
      } as never);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: null,
          }),
        }),
      );
    });

    it('should throw ConflictException when phone belongs to another user', async () => {
      prisma.user.findFirst.mockResolvedValue(
        createMockUser({ phone: '0901234567' }) as never,
      );

      await expect(
        service.updateMe(uuid(), {
          phone: '0901234567',
        } as never),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── changePassword ─────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('should change password and revoke refresh tokens', async () => {
      const oldPassword = 'oldpass123';
      const hash = await bcrypt.hash(oldPassword, 10);
      const user = createMockUser({ passwordHash: hash });
      prisma.user.findUnique.mockResolvedValue(user as never);
      prisma.user.update.mockResolvedValue(user as never);
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 } as never);

      const result = await service.changePassword(user.id, {
        oldPassword,
        newPassword: 'newpass456',
      } as never);

      expect(result).toEqual({ passwordChanged: true });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      const hash = await bcrypt.hash('correctpass', 10);
      const user = createMockUser({ passwordHash: hash });
      prisma.user.findUnique.mockResolvedValue(user as never);

      await expect(
        service.changePassword(user.id, {
          oldPassword: 'wrong',
          newPassword: 'newpass',
        } as never),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when new password is same as old', async () => {
      const password = 'samepass123';
      const hash = await bcrypt.hash(password, 10);
      const user = createMockUser({ passwordHash: hash });
      prisma.user.findUnique.mockResolvedValue(user as never);

      await expect(
        service.changePassword(user.id, {
          oldPassword: password,
          newPassword: password,
        } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.changePassword(uuid(), {
          oldPassword: 'a',
          newPassword: 'b',
        } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateUser (admin) ─────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('should update role and fullName', async () => {
      const user = createMockUser();
      const updated = createMockUser({
        fullName: 'Admin User',
        role: UserRole.ADMIN,
      });
      prisma.user.findUnique.mockResolvedValue(user as never);
      prisma.user.update.mockResolvedValue(updated as never);

      const result = await service.updateUser(user.id, {
        fullName: 'Admin User',
        role: UserRole.ADMIN,
      } as never);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.updateUser(uuid(), { fullName: 'x' } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── softDelete ─────────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should soft-delete user and revoke refresh tokens', async () => {
      const user = createMockUser();
      prisma.user.findUnique.mockResolvedValue(user as never);
      prisma.user.update.mockResolvedValue({
        ...user,
        deletedAt: new Date(),
      } as never);
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 } as never);

      const result = await service.softDelete(user.id);
      expect(result).toEqual({ deleted: true });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.softDelete(uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
