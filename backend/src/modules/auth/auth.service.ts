import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
const RESET_TOKEN_TTL_SECONDS = 15 * 60;
const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase().trim(), deletedAt: null },
    });

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'reset-password',
      passwordHash: user.passwordHash,
    };

    const resetToken = this.jwtService.sign(payload, {
      secret: this.resetSecret,
      expiresIn: RESET_TOKEN_TTL_SECONDS,
    });

    return {
      message: 'If the email exists, a reset link has been sent',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const payload = this.verifyResetToken(dto.token);
    const user = await this.findActiveUser(payload.sub);

    if (payload.passwordHash !== user.passwordHash) {
      throw new UnauthorizedException('Reset token is no longer valid');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await this.hashPassword(dto.password) },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
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

  private verifyResetToken(token: string): JwtPayload {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.resetSecret,
      });

      if (payload.type !== 'reset-password') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  private get resetSecret(): string {
    return (
      this.configService.get<string>('JWT_RESET_SECRET') ??
      'luxekeys-reset-development-secret'
    );
  }
}
