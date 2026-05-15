import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  Prisma,
  User,
  UserRole,
  UserStatus,
} from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthUser, JwtPayload } from './interfaces/auth-user.interface';
import { MailService } from './mail.service';

type TokenPair = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export type AuthResponse = TokenPair & {
  user: AuthUser;
  refreshToken: string;
};

type RefreshTokenContext = {
  userAgent?: string;
  ipAddress?: string;
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_DAYS = 7;
const RESET_CODE_TTL_MINUTES = 15;
const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(
    dto: RegisterDto,
    context: RefreshTokenContext,
  ): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();

    await this.ensureUniqueUser(email, dto.phone);

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
        passwordHash: await this.hashPassword(dto.password),
        role: UserRole.CUSTOMER,
      },
    });

    return this.buildAuthResponse(user, context);
  }

  async login(
    dto: LoginDto,
    context: RefreshTokenContext,
  ): Promise<AuthResponse> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase().trim(), deletedAt: null },
    });

    if (
      !user ||
      !(await this.verifyPassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is no longer active');
    }

    if (!this.isBcryptHash(user.passwordHash)) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await this.hashPassword(dto.password) },
      });
    }

    const loggedInUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(loggedInUser, context);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
    }

    return { loggedOut: true };
  }

  async refresh(
    refreshToken: string | undefined,
    context: RefreshTokenContext,
  ): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokenParts = this.parseRefreshToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        id: tokenParts.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(
      tokenParts.secret,
      storedToken.tokenHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      storedToken.user.deletedAt ||
      storedToken.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('User is no longer active');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.buildAuthResponse(storedToken.user, context);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const message = 'If the email exists, a password reset code has been sent';
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null, status: UserStatus.ACTIVE },
    });

    if (!user) {
      return { message };
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMinutes(expiresAt.getMinutes() + RESET_CODE_TTL_MINUTES);
    const code = this.generateResetCode();

    await this.prisma.passwordResetCode.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: now },
    });

    await this.prisma.passwordResetCode.create({
      data: {
        userId: user.id,
        codeHash: await this.hashPassword(code),
        passwordHash: user.passwordHash,
        expiresAt,
      },
    });

    await this.mailService.sendPasswordResetCode(
      user.email,
      user.fullName,
      code,
    );

    return { message };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    const resetCode = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (
      !resetCode ||
      resetCode.passwordHash !== user.passwordHash ||
      !(await bcrypt.compare(dto.code, resetCode.codeHash))
    ) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await this.hashPassword(dto.password) },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.prisma.passwordResetCode.update({
      where: { id: resetCode.id },
      data: { consumedAt: new Date() },
    });

    return { passwordReset: true };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<AuthUser> {
    return this.toAuthUser(await this.findActiveUser(payload.sub));
  }

  private async ensureUniqueUser(email: string, phone?: string) {
    const where: Prisma.UserWhereInput = {
      OR: [{ email }, ...(phone ? [{ phone }] : [])],
    };

    const existing = await this.prisma.user.findFirst({ where });
    if (!existing) return;

    if (existing.email === email) {
      throw new ConflictException('Email is already registered');
    }

    throw new ConflictException('Phone is already registered');
  }

  private async findActiveUser(id: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token subject');
    }

    return user;
  }

  private async buildAuthResponse(
    user: User,
    context: RefreshTokenContext,
  ): Promise<AuthResponse> {
    const refreshToken = await this.issueRefreshToken(user.id, context);

    return {
      user: this.toAuthUser(user),
      accessToken: this.issueAccessToken(user),
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  private issueAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    return this.jwtService.sign(payload);
  }

  private async issueRefreshToken(
    userId: string,
    context: RefreshTokenContext,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const secret = crypto.randomBytes(64).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        id,
        userId,
        tokenHash: await bcrypt.hash(secret, BCRYPT_SALT_ROUNDS),
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        expiresAt,
      },
    });

    return `${id}.${secret}`;
  }

  private async revokeRefreshToken(refreshToken: string) {
    const tokenParts = this.parseRefreshToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { id: tokenParts.id, revokedAt: null },
    });

    if (
      storedToken &&
      (await bcrypt.compare(tokenParts.secret, storedToken.tokenHash))
    ) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  private parseRefreshToken(refreshToken: string) {
    const [id, secret] = refreshToken.split('.');
    if (!id || !secret) {
      throw new UnauthorizedException('Malformed refresh token');
    }

    return { id, secret };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  private async verifyPassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    if (this.isBcryptHash(storedHash)) {
      return bcrypt.compare(password, storedHash);
    }

    const legacyHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    return legacyHash === storedHash;
  }

  private isBcryptHash(hash: string): boolean {
    return hash.startsWith('$2a$') || hash.startsWith('$2b$');
  }

  private generateResetCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }
}
