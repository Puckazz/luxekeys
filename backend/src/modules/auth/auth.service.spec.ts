import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { MailService } from './mail.service.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  createMockPrismaService,
  MockPrismaService,
  createMockUser,
  createMockRefreshToken,
  uuid,
} from '../../common/testing/index.js';
import { UserRole } from '../../generated/prisma/index.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;

  const mockContext = { userAgent: 'test-agent', ipAddress: '127.0.0.1' };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
    mailService = {
      sendPasswordResetCode: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MailService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ─── register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should create user and return AuthResponse', async () => {
      const dto = {
        email: 'NEW@example.com',
        fullName: 'New User',
        password: 'pass1234',
      };
      const user = createMockUser({
        email: 'new@example.com',
        fullName: 'New User',
      });

      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(user as never);
      prisma.refreshToken.create.mockResolvedValue(
        createMockRefreshToken({ userId: user.id }) as never,
      );

      const result = await service.register(dto as never, mockContext);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('new@example.com');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'new@example.com' }),
        }),
      );
    });

    it('should throw ConflictException when email is already registered', async () => {
      const dto = {
        email: 'existing@example.com',
        fullName: 'User',
        password: 'pass',
      };
      const existing = createMockUser({ email: 'existing@example.com' });
      prisma.user.findFirst.mockResolvedValue(existing as never);

      await expect(service.register(dto as never, mockContext)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when phone is already registered', async () => {
      const dto = {
        email: 'a@b.com',
        phone: '0901234567',
        fullName: 'User',
        password: 'pass',
      };
      const existing = createMockUser({
        email: 'other@b.com',
        phone: '0901234567',
      });
      prisma.user.findFirst.mockResolvedValue(existing as never);

      await expect(service.register(dto as never, mockContext)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should lowercase and trim the email', async () => {
      const dto = {
        email: '  USER@EXAMPLE.COM  ',
        fullName: 'User',
        password: 'pass',
      };
      const user = createMockUser({ email: 'user@example.com' });
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(user as never);
      prisma.refreshToken.create.mockResolvedValue(
        createMockRefreshToken() as never,
      );

      await service.register(dto as never, mockContext);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'user@example.com' }),
        }),
      );
    });
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return AuthResponse on valid credentials', async () => {
      const password = 'correctpass';
      const hash = await bcrypt.hash(password, 10);
      const user = createMockUser({
        email: 'test@example.com',
        passwordHash: hash,
      });
      const dto = { email: 'test@example.com', password };

      prisma.user.findFirst.mockResolvedValue(user as never);
      prisma.user.update.mockResolvedValue(user as never);
      prisma.refreshToken.create.mockResolvedValue(
        createMockRefreshToken({ userId: user.id }) as never,
      );

      const result = await service.login(dto as never, mockContext);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'no@one.com', password: 'pass' } as never,
          mockContext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const hash = await bcrypt.hash('correctpass', 10);
      const user = createMockUser({ passwordHash: hash });
      prisma.user.findFirst.mockResolvedValue(user as never);

      await expect(
        service.login(
          { email: user.email, password: 'wrongpass' } as never,
          mockContext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should return { loggedOut: true }', async () => {
      const result = await service.logout(undefined);
      expect(result).toEqual({ loggedOut: true });
    });

    it('should revoke refresh token when provided', async () => {
      const stored = createMockRefreshToken();
      const tokenId = stored.id;
      const secret = 'mysecret';
      const hash = await bcrypt.hash(secret, 10);
      stored.tokenHash = hash;

      prisma.refreshToken.findFirst.mockResolvedValue(stored as never);
      prisma.refreshToken.update.mockResolvedValue({
        ...stored,
        revokedAt: new Date(),
      } as never);

      await service.logout(`${tokenId}.${secret}`);
      expect(prisma.refreshToken.update).toHaveBeenCalled();
    });
  });

  // ─── refresh ────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should throw UnauthorizedException when refreshToken is undefined', async () => {
      await expect(service.refresh(undefined, mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token has invalid format', async () => {
      await expect(
        service.refresh('invalid-no-dot', mockContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when stored token is not found', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue(null);
      await expect(
        service.refresh(`${uuid()}.secret`, mockContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token hash does not match', async () => {
      const stored = {
        ...createMockRefreshToken(),
        tokenHash: await bcrypt.hash('othersecret', 10),
        user: createMockUser(),
      };
      prisma.refreshToken.findFirst.mockResolvedValue(stored as never);

      await expect(
        service.refresh(`${stored.id}.wrongsecret`, mockContext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should issue new tokens when refresh token is valid', async () => {
      const secret = 'valid-secret';
      const user = createMockUser();
      const stored = {
        ...createMockRefreshToken({ userId: user.id }),
        tokenHash: await bcrypt.hash(secret, 10),
        user,
      };

      prisma.refreshToken.findFirst.mockResolvedValue(stored as never);
      prisma.refreshToken.update.mockResolvedValue(stored as never);
      prisma.refreshToken.create.mockResolvedValue(stored as never);

      const result = await service.refresh(
        `${stored.id}.${secret}`,
        mockContext,
      );
      expect(result).toHaveProperty('accessToken');
    });
  });

  // ─── forgotPassword ─────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should return generic message when user exists', async () => {
      const user = createMockUser();
      prisma.user.findFirst.mockResolvedValue(user as never);
      prisma.passwordResetCode.updateMany.mockResolvedValue({
        count: 0,
      } as never);
      prisma.passwordResetCode.create.mockResolvedValue({} as never);

      const result = await service.forgotPassword({
        email: 'test@example.com',
      });
      expect(result.message).toMatch(/reset code/i);
      expect(prisma.passwordResetCode.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: user.id }),
        }),
      );
      expect(mailService.sendPasswordResetCode).toHaveBeenCalledWith(
        user.email,
        user.fullName,
        expect.stringMatching(/^\d{6}$/),
      );
    });

    it('should return same generic message when user does NOT exist (prevent enumeration)', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'ghost@example.com',
      });
      expect(result.message).toMatch(/reset code/i);
      expect(prisma.passwordResetCode.create).not.toHaveBeenCalled();
      expect(mailService.sendPasswordResetCode).not.toHaveBeenCalled();
    });
  });

  // ─── resetPassword ──────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          email: 'missing@example.com',
          code: '123456',
          password: 'newpass123',
        } as never),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password has already changed', async () => {
      const user = createMockUser({ passwordHash: '$2b$10$newHash' });
      prisma.user.findFirst.mockResolvedValue(user as never);
      prisma.passwordResetCode.findFirst.mockResolvedValue({
        id: uuid(),
        userId: user.id,
        codeHash: await bcrypt.hash('123456', 10),
        passwordHash: '$2b$10$oldHash',
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      await expect(
        service.resetPassword({
          email: user.email,
          code: '123456',
          password: 'newpass',
        } as never),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reset password and revoke refresh tokens', async () => {
      const user = createMockUser({ passwordHash: '$2b$10$originalHash' });
      const resetCode = {
        id: uuid(),
        userId: user.id,
        codeHash: await bcrypt.hash('123456', 10),
        passwordHash: '$2b$10$originalHash',
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findFirst.mockResolvedValue(user as never);
      prisma.passwordResetCode.findFirst.mockResolvedValue(resetCode as never);
      prisma.user.update.mockResolvedValue(user as never);
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 } as never);
      prisma.passwordResetCode.update.mockResolvedValue({
        ...resetCode,
        consumedAt: new Date(),
      } as never);

      const result = await service.resetPassword({
        email: user.email,
        code: '123456',
        password: 'newpass123',
      } as never);
      expect(result).toEqual({ passwordReset: true });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
      expect(prisma.passwordResetCode.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: resetCode.id } }),
      );
    });
  });

  // ─── validateJwtPayload ─────────────────────────────────────────────────────

  describe('validateJwtPayload', () => {
    it('should return AuthUser when user is active', async () => {
      const user = createMockUser();
      prisma.user.findFirst.mockResolvedValue(user as never);

      const result = await service.validateJwtPayload({
        sub: user.id,
        email: user.email,
        role: UserRole.CUSTOMER,
        type: 'access',
      });

      expect(result).toMatchObject({ id: user.id, email: user.email });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.validateJwtPayload({
          sub: uuid(),
          email: 'x@x.com',
          role: UserRole.CUSTOMER,
          type: 'access',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
