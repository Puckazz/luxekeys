import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { UserRole, UserStatus } from '../../generated/prisma/index.js';

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

  // ─── createAdminUser ───────────────────────────────────────────────────────

  describe('createAdminUser', () => {
    it('should create a user with a hashed password', async () => {
      const user = createMockUser({
        email: 'new@example.com',
        fullName: 'New User',
        status: UserStatus.INACTIVE,
      });
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(user as never);

      const result = await service.createAdminUser({
        email: ' New@Example.com ',
        fullName: 'New User',
        password: 'password123',
        role: UserRole.CUSTOMER,
        status: UserStatus.INACTIVE,
      });

      expect(result.email).toBe('new@example.com');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new@example.com',
            role: UserRole.CUSTOMER,
            status: UserStatus.INACTIVE,
            passwordHash: expect.stringMatching(/^\$2[ab]\$/),
          }),
        }),
      );
    });

    it('should throw ConflictException when email is already registered', async () => {
      prisma.user.findFirst.mockResolvedValue(createMockUser() as never);

      await expect(
        service.createAdminUser({
          email: 'test@example.com',
          fullName: 'Test User',
          password: 'password123',
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── findManagementUsers ───────────────────────────────────────────────────

  describe('findManagementUsers', () => {
    it('should return paginated users with status summary', async () => {
      const users = [
        createMockUser({ status: UserStatus.ACTIVE }),
        createMockUser({ status: UserStatus.SUSPENDED }),
        createMockUser({ deletedAt: new Date() }),
      ];
      prisma.user.findMany.mockResolvedValue(users as never);

      const result = await service.findManagementUsers({} as never);

      expect(result.data.items).toHaveLength(2);
      expect(result.data.summary).toEqual({
        all: 2,
        ACTIVE: 1,
        INACTIVE: 0,
        SUSPENDED: 1,
        ARCHIVED: 1,
      });
    });

    it('should filter archived users', async () => {
      const archivedUser = createMockUser({ deletedAt: new Date() });
      prisma.user.findMany.mockResolvedValue([
        createMockUser(),
        archivedUser,
      ] as never);

      const result = await service.findManagementUsers({
        status: 'ARCHIVED',
      } as never);

      expect(result.data.items).toEqual([archivedUser]);
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
    it('should update email, role, fullName, and status', async () => {
      const user = createMockUser();
      const updated = createMockUser({
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: UserRole.ADMIN,
        status: UserStatus.SUSPENDED,
      });
      prisma.user.findUnique.mockResolvedValue(user as never);
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue(updated as never);

      const result = await service.updateUser(
        {
          id: 'actor-id',
          email: 'actor@example.com',
          fullName: 'Actor User',
          role: UserRole.ADMIN,
        } as never,
        user.id,
        {
          email: ' Admin@Example.com ',
          fullName: 'Admin User',
          role: UserRole.ADMIN,
          status: UserStatus.SUSPENDED,
        } as never,
      );
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.status).toBe(UserStatus.SUSPENDED);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'admin@example.com',
            status: UserStatus.SUSPENDED,
          }),
        }),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.updateUser(
          {
            id: 'actor-id',
            email: 'actor@example.com',
            fullName: 'Actor User',
            role: UserRole.ADMIN,
          } as never,
          uuid(),
          { fullName: 'x' } as never,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email belongs to another user', async () => {
      prisma.user.findUnique.mockResolvedValue(createMockUser() as never);
      prisma.user.findFirst.mockResolvedValue(createMockUser() as never);

      await expect(
        service.updateUser(
          {
            id: 'actor-id',
            email: 'actor@example.com',
            fullName: 'Actor User',
            role: UserRole.ADMIN,
          } as never,
          uuid(),
          { email: 'taken@example.com' } as never,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should forbid admins from editing their own account via admin management', async () => {
      const user = createMockUser({ id: 'actor-id', role: UserRole.ADMIN });
      prisma.user.findUnique.mockResolvedValue(user as never);

      await expect(
        service.updateUser(
          {
            id: 'actor-id',
            email: 'actor@example.com',
            fullName: 'Actor User',
            role: UserRole.ADMIN,
          } as never,
          user.id,
          { fullName: 'New Name' } as never,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid admins from editing other admin accounts', async () => {
      const targetAdmin = createMockUser({ role: UserRole.ADMIN });
      prisma.user.findUnique.mockResolvedValue(targetAdmin as never);

      await expect(
        service.updateUser(
          {
            id: 'actor-id',
            email: 'actor@example.com',
            fullName: 'Actor User',
            role: UserRole.ADMIN,
          } as never,
          targetAdmin.id,
          { fullName: 'New Name' } as never,
        ),
      ).rejects.toThrow(ForbiddenException);
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

      const result = await service.softDelete(
        {
          id: 'actor-id',
          email: 'actor@example.com',
          fullName: 'Actor User',
          role: UserRole.ADMIN,
        } as never,
        user.id,
      );
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.softDelete(
          {
            id: 'actor-id',
            email: 'actor@example.com',
            fullName: 'Actor User',
            role: UserRole.ADMIN,
          } as never,
          uuid(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should forbid archiving admin accounts from user management', async () => {
      const user = createMockUser({ role: UserRole.ADMIN });
      prisma.user.findUnique.mockResolvedValue(user as never);

      await expect(
        service.softDelete(
          {
            id: 'actor-id',
            email: 'actor@example.com',
            fullName: 'Actor User',
            role: UserRole.ADMIN,
          } as never,
          user.id,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── restore ───────────────────────────────────────────────────────────────

  describe('restore', () => {
    it('should restore archived user as inactive', async () => {
      const user = createMockUser({ deletedAt: new Date() });
      const restored = createMockUser({
        deletedAt: null,
        status: UserStatus.INACTIVE,
      });
      prisma.user.findUnique.mockResolvedValue(user as never);
      prisma.user.update.mockResolvedValue(restored as never);

      const result = await service.restore(
        {
          id: 'actor-id',
          email: 'actor@example.com',
          fullName: 'Actor User',
          role: UserRole.ADMIN,
        } as never,
        user.id,
      );

      expect(result.status).toBe(UserStatus.INACTIVE);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            deletedAt: null,
            status: UserStatus.INACTIVE,
          },
        }),
      );
    });

    it('should forbid restoring admin accounts from user management', async () => {
      const user = createMockUser({
        role: UserRole.ADMIN,
        deletedAt: new Date(),
      });
      prisma.user.findUnique.mockResolvedValue(user as never);

      await expect(
        service.restore(
          {
            id: 'actor-id',
            email: 'actor@example.com',
            fullName: 'Actor User',
            role: UserRole.ADMIN,
          } as never,
          user.id,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
